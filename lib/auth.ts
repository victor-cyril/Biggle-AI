import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { cache } from "react";
import { headers } from "next/headers";
import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { polarClient } from "./polar";
import { POLAR_PLANS } from "./polar/plans";
import { nextCookies } from "better-auth/next-js";
import {
  createDefaultSubscription,
  updateSubscriptionPlan,
} from "./polar/utils";

export const auth = betterAuth({
  appName: "Biggle AI",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  plugins: [
    openAPI(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: POLAR_PLANS.filter((p) => !!p.productId).map((product) => ({
            productId: product.productId!,
            slug: product.name,
          })),
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          returnUrl: "/billing",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onPayload: async ({ type, data }) => {
            if (type === "customer.created") {
              await createDefaultSubscription(data.email, data.id);
              return;
            }
          },
          onSubscriptionCreated: async ({ data }) => {
            // Handle subscription created event
            // Update user account stats based on the new subscription plan
            await updateSubscriptionPlan(data);
          },
          onSubscriptionUpdated: async ({ data }) => {
            // Handle subscription created event
            // Update user account stats based on the new subscription plan
            await updateSubscriptionPlan(data);
          },
          onSubscriptionCanceled: async ({ data }) => {
            console.log("Subscription canceled", data);
            await updateSubscriptionPlan(data);
          },
          // onCustomerStateChanged: async ({ data }) => {
          //   console.log("Customer state changed", data);
          // },
          // onSubscriptionActive: async ({ data }) => {
          //   // Handle subscription created event
          //   // Update user account stats based on the new subscription plan
          //   console.log("Subscription is now active", data);
          //   // await updatePlan(data);
          // },
          // onSubscriptionUpdated: async ({ data }) => {
          //   // Handle subscription created event
          //   // Update user account stats based on the new subscription plan
          //   console.log("Subscription updated", data);
          //   // await updatePlan(data);
          // },
        }),
      ],
    }),
    nextCookies(),
  ],
});

export const getServerSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
});
