"use server";
import { myProvider } from "@/lib/ai/providers";
import { POLAR_PLANS } from "@/lib/polar/plans";
// import { PLAN_ENUM, PLANS } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { generateText, type UIMessage } from "ai";
import { HTTPException } from "hono/http-exception";

export async function generateTitleForUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    const { text } = await generateText({
      model: myProvider.languageModel("title-model"),
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });
    return text;
  } catch (error) {
    console.log("Tile ai error", error);
    return "Untitled";
  }
}

export async function checkGenerationLimit(userId: string): Promise<{
  isAllowed: boolean;
  hasPaidSubscription: boolean;
  plan: string;
  generationsUsed: number;
  generationsLimit: number | null;
  remainingGenerations: number | "Unlimited";
  subscriptionDetails: {
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean | null;
  };
}> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: userId,
      status: "active",
    },
  });

  if (!subscription) {
    throw new HTTPException(404, { message: "No active subscription" });
  }

  const plan = POLAR_PLANS.find((p) => p.name === subscription.plan);

  if (!plan)
    throw new HTTPException(400, {
      message: "No Subscription or invalid plan",
    });

  const currentPeriodStart = subscription.currentPeriodStart ?? new Date(0);
  const currentPeriodEnd = subscription.currentPeriodEnd ?? new Date();
  const subscriptionDetails = {
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };

  if (
    plan.limits.generations === Infinity &&
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date()
  ) {
    return {
      isAllowed: true,
      hasPaidSubscription: !!subscription.polarSubscriptionId,
      plan: subscription.plan,
      generationsUsed: 0,
      generationsLimit: null,
      remainingGenerations: "Unlimited",
      subscriptionDetails,
    };
  } else {
    // Get all generation count for the user in the current billing period
    const generationCount = await prisma.message.count({
      where: {
        chat: { userId },
        role: "assistant",
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd,
        },
      },
    });

    return {
      isAllowed: generationCount < plan.limits.generations,
      hasPaidSubscription: !!subscription.polarSubscriptionId,
      plan: subscription.plan,
      generationsUsed: generationCount,
      generationsLimit: plan.limits.generations,
      remainingGenerations: Math.max(
        0,
        plan.limits.generations - generationCount
      ),
      subscriptionDetails,
    };
  }
}
