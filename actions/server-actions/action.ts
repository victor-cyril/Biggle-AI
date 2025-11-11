"use server";
import { myProvider } from "@/lib/ai/providers";
import { auth } from "@/lib/auth";
import { POLAR_PLANS } from "@/lib/polar/plans";
// import { PLAN_ENUM, PLANS } from "@/lib/constant";
import prisma from "@/lib/prisma";
import { Plan } from "@/prisma/generated/prisma/enums";
import { generateText, type UIMessage } from "ai";
import { headers } from "next/headers";

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
  plan: Plan;
  generationsUsed: number;
  generationsLimit: number | null;
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

  const plan = POLAR_PLANS.find((p) => p.name === subscription?.plan);

  if (!subscription || !plan) {
    return {
      isAllowed: false,
      hasPaidSubscription: false,
      plan: "free",
      generationsUsed: 0,
      generationsLimit: 0,
      subscriptionDetails: {
        currentPeriodStart: new Date(0),
        currentPeriodEnd: new Date(0),
      },
    };
  }

  const currentPeriodStart = subscription.currentPeriodStart ?? new Date(0);
  const currentPeriodEnd = subscription.currentPeriodEnd ?? new Date();
  const subscriptionDetails = {
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };

  if (
    plan.name === "premium" &&
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
      subscriptionDetails,
    };
  }

  if (
    plan.name === "plus" &&
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date()
  ) {
    // Call polar event
    const meters = await auth.api.meters({
      query: { page: 1, limit: 10 },
      headers: await headers(),
    });

    const firstMeter = meters?.result?.items[0];
    const consumedUnits = firstMeter?.consumedUnits || 0;
    const creditedUnits = firstMeter?.creditedUnits || 0;

    return {
      isAllowed: consumedUnits <= creditedUnits,
      hasPaidSubscription: !!subscription.polarSubscriptionId,
      plan: subscription.plan,
      generationsUsed: consumedUnits,
      generationsLimit: creditedUnits,
      subscriptionDetails,
    };
  }

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
    subscriptionDetails,
  };
}
