import "server-only";
import prisma from "../prisma";
import { PLAN_ENUM, POLAR_PLANS } from "./plans";
import { type Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { APIError } from "better-auth";

export async function createDefaultSubscription(
  email: string,
  polarCustomerId: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new APIError("NOT_FOUND", {
        message: "User not found",
      });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { referenceId: user.id },
    });

    if (existingSubscription) {
      return {
        success: true,
        subscription: existingSubscription,
      };
    }

    const subscription = await prisma.subscription.create({
      data: {
        referenceId: user.id,
        plan: PLAN_ENUM.FREE,
        polarCustomerId: polarCustomerId,
        status: "active",
      },
    });

    return { success: true, subscription };
  } catch (error) {
    console.log(error);
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Failed to create subscription",
    });
  }
}

export async function updatePolarCustomerId(
  userId: string,
  polarCustomerId: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new APIError("NOT_FOUND", {
        message: "User does not exist",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { polarCustomerId },
    });

    return { success: true, user };
  } catch (error) {
    console.log(error);
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Failed to update Polar Customer ID",
    });
  }
}

export async function updateSubscriptionPlan(data: Subscription) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.customer?.email },
          { id: data.customer?.externalId || undefined },
        ],
      },
    });

    if (!user) {
      throw new APIError("NOT_FOUND", {
        message: "User not found",
      });
    }

    let subscription = await prisma.subscription.findFirst({
      where: { referenceId: user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          referenceId: user.id,
          plan: PLAN_ENUM.FREE,
          polarCustomerId: data.customerId,
          status: "active",
        },
      });
    }

    const newPlan = POLAR_PLANS.find(
      (plan) => plan.productId === data.productId
    );

    if (!newPlan) {
      throw new APIError("NOT_FOUND", {
        message: "Plan not found for the given product ID",
      });
    }

    if (data.status === "canceled") {
      // If already on free plan, no need to update
      if (
        subscription.plan === PLAN_ENUM.FREE &&
        subscription.status === "active"
      ) {
        return { success: true, updatedSubscription: subscription };
      }

      // Downgrade to free plan on cancellation
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          referenceId: user.id,
          plan: PLAN_ENUM.FREE,
          polarCustomerId: data.customerId,
          status: "active",
        },
      });

      return { success: true, updatedSubscription };
    }

    let plan = newPlan.name;

    if (
      data.canceledAt &&
      data.cancelAtPeriodEnd &&
      data.currentPeriodEnd &&
      data.currentPeriodEnd <= new Date()
    ) {
      plan = PLAN_ENUM.FREE;
    }

    // Update subscription plan
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: plan,
        polarCustomerId: data.customerId,
        polarSubscriptionId: data.id,
        polarCheckoutId: data.checkoutId,
        polarProductId: data.productId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        canceledAt: data.canceledAt,
        createdAt: data.createdAt,
        updatedAt: new Date(),
        seats: data.seats,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        recurringInterval: data.recurringInterval,
        recurringIntervalCount: data.recurringIntervalCount,
      },
    });

    return { success: true, updatedSubscription };
  } catch (error) {
    console.log(error);
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Failed to update subscription plan",
    });
  }
}
