import { auth } from "@/lib/auth";
import { PLAN_ENUM, POLAR_PLANS } from "@/lib/polar/plans";
import { getAuthUser } from "@/lib/hono/hono-middleware";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { checkGenerationLimit } from "@/actions/server-actions/action";

const upgradeSchema = z.object({
  plan: z.enum([PLAN_ENUM.PLUS, PLAN_ENUM.PREMIUM]),
  callbackUrl: z.string().min(1),
});

export const subscriptionRoute = new Hono()
  .post(
    "/upgrade",
    zValidator("json", upgradeSchema),
    getAuthUser,
    async (c) => {
      try {
        const body = c.req.valid("json");
        const user = c.get("user");

        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            referenceId: user.id,
            status: "active",
          },
        });

        if (existingSubscription?.plan === body.plan) {
          throw new HTTPException(400, {
            message: `You are already on the ${body.plan} plan`,
          });
        }

        const productId = POLAR_PLANS.find(
          (p) => p.name === body.plan
        )?.productId;
        if (!productId) {
          throw new HTTPException(400, {
            message: "Invalid plan selected",
          });
        }

        const data = await auth.api.checkout({
          body: {
            products: [productId],
            slug: body.plan,
          },
          headers: c.req.raw.headers,
        });

        return c.json({
          success: true,
          checkoutUrl: data.url,
        });
      } catch (error: any) {
        console.log(error);
        if (error instanceof HTTPException) {
          throw error;
        }
        throw new HTTPException(500, {
          message: "Failed to create checkout session, please try again..",
        });
      }
    }
  )
  .get("/generations", getAuthUser, async (c) => {
    try {
      const user = c.get("user");

      const data = await checkGenerationLimit(user.id);

      return c.json({
        success: true,
        data: data || null,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "Failed to retrieve generations data.",
      });
    }
  });
