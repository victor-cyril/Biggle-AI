import { Plan } from "@/prisma/generated/prisma/enums";

export const PLAN_ENUM = {
  FREE: Plan.free,
  PLUS: Plan.plus,
  PREMIUM: Plan.premium,
} as const;

export type PLAN_ENUM_TYPE = keyof typeof PLAN_ENUM;
export type PLAN_ENUM_VALUE = (typeof PLAN_ENUM)[keyof typeof PLAN_ENUM];

const PLUS_PRODUCT_ID = process.env.POLAR_PLUS_PRODUCT_ID!;
const PREMIUM_PRODUCT_ID = process.env.POLAR_PREMIUM_PRODUCT_ID!;

export const PLAN_TO_PRICE: Record<PLAN_ENUM_TYPE, number> = {
  FREE: 0,
  PLUS: 12,
  PREMIUM: 24,
};

export const PLAN_TO_GENERATION_LIMITS: Record<PLAN_ENUM_TYPE, number> = {
  FREE: 10,
  PLUS: 300,
  PREMIUM: Infinity,
};

export type PAID_PLAN_ENUM_TYPE = Exclude<PLAN_ENUM_VALUE, "free">;

export const UPGRADEABLE_PLANS: PLAN_ENUM_VALUE[] = [
  PLAN_ENUM.PLUS,
  PLAN_ENUM.PREMIUM,
];

export const POLAR_PLANS = [
  {
    id: 1,
    name: PLAN_ENUM.FREE,
    price: PLAN_TO_PRICE.FREE,
    productId: undefined,
    features: [
      `${PLAN_TO_GENERATION_LIMITS.FREE} AI generations per month`,
      "Basic support",
      "Limited notes creation",
      "Access to core features",
      "Community access",
      "Single user only",
    ],
    limits: {
      generations: PLAN_TO_GENERATION_LIMITS.FREE,
    },
  },
  {
    id: 2,
    name: PLAN_ENUM.PLUS,
    price: 12,
    productId: PLUS_PRODUCT_ID,
    features: [
      `${PLAN_TO_GENERATION_LIMITS.PLUS} AI generations per month`,
      "Unlimited notes creation",
      "Priority support",
      "Access to all features",
      "AI Advanced search",
    ],
    limits: {
      generations: PLAN_TO_GENERATION_LIMITS.PLUS,
    },
  },
  {
    id: 3,
    name: PLAN_ENUM.PREMIUM,
    price: 24,
    productId: PREMIUM_PRODUCT_ID,
    features: [
      "Unlimited AI generations",
      "Unlimited notes creation",
      "Priority support",
      "Early access to new features",
      "AI Advanced search",
      "Advanced admin & analytics",
      "Custom integrations & API access",
    ],
    limits: {
      generations: Infinity,
    },
  },
];
