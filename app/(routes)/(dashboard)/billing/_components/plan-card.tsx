import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PAID_PLAN_ENUM_TYPE,
  PLAN_ENUM,
  PLAN_ENUM_VALUE,
  POLAR_PLANS,
  UPGRADEABLE_PLANS,
} from "@/lib/polar/plans";
import { cn } from "@/lib/utils";
import { Check, Loader } from "lucide-react";
import { InferResponseType } from "hono";
import { api } from "@/lib/hono/hono-rpc";
import { authClient } from "@/lib/auth-client";

interface Props {
  plan: (typeof POLAR_PLANS)[number];
  subscription?: InferResponseType<
    typeof api.subscription.generations.$get
  >["data"];
  loading: boolean;
  error: string | null;
  isUpgrading: boolean;
  onUpgrade: (plan: PAID_PLAN_ENUM_TYPE) => void;
}

const PlanCard = React.memo(
  ({ plan, subscription, loading, error, isUpgrading, onUpgrade }: Props) => {
    const isFree = plan.name === PLAN_ENUM.FREE;
    const isPopular = plan.name === PLAN_ENUM.PREMIUM;
    const isCurrent = subscription?.plan === plan.name;
    const action = subscription?.hasPaidSubscription
      ? "Switch plan"
      : "Upgrade";
    const [planClicked, setPlanClicked] =
      React.useState<PLAN_ENUM_VALUE | null>(null);

    const generationsUsed = isCurrent ? subscription?.generationsUsed ?? 0 : 0;

    const generationsLimit = isCurrent ? subscription?.generationsLimit : null;

    const percentUsed =
      generationsLimit && generationsLimit > 0
        ? Math.min((generationsUsed / generationsLimit) * 100, 100)
        : 0;

    return (
      <div className="flex flex-col p-6 border-l">
        <div className="flex-1">
          <div className="flex items-center justify-start gap-2 mb-2">
            <h3 className="capitalize text-lg lg:text-xl font-semibold">
              {plan?.name?.toLowerCase()}
            </h3>

            {isPopular && !isCurrent && (
              <Badge className="bg-primary/10 text-primary text-xs">
                Popular
              </Badge>
            )}

            {isCurrent && (
              <Badge className="bg-gray-200 text-gray-700 text-xs">
                Current
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <div className="text-base font-normal">
              ${plan.price}
              <span className="text-sm text-muted-foreground ml-1">
                per month billed
              </span>
            </div>
          </div>

          {isCurrent &&
            subscription?.subscriptionDetails?.currentPeriodEnd &&
            !isFree && (
              <p className="text-sm mb-2 text-primary">
                {subscription?.subscriptionDetails?.cancelAtPeriodEnd
                  ? "Cancels on "
                  : "Renews on "}
                {new Date(
                  subscription.subscriptionDetails.currentPeriodEnd
                ).toLocaleDateString()}
              </p>
            )}

          {isCurrent && (
            <div className="mb-4 text-sm text-muted-foreground">
              {generationsLimit === null ? (
                "Unlimited generations"
              ) : (
                <>
                  {generationsUsed} / {generationsLimit} generations used
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-3 bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-8 w-28 rounded-md" />
        ) : error ? (
          <div className="text-sm text-destructive">
            Failed to load generations
          </div>
        ) : isCurrent && plan.name !== PLAN_ENUM.FREE ? (
          <Button
            variant="outline"
            onClick={async () => await authClient.customer.portal()}
          >
            Manage
          </Button>
        ) : UPGRADEABLE_PLANS.includes(plan.name) ? (
          <Button
            variant={isPopular ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              isPopular && "bg-primary hover:opacity-80 text-white"
            )}
            disabled={isUpgrading && planClicked === plan.name}
            onClick={() => {
              setPlanClicked(plan.name);
              onUpgrade(plan.name as PAID_PLAN_ENUM_TYPE);
            }}
          >
            {isUpgrading && planClicked === plan.name ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>{action}</>
            )}
          </Button>
        ) : null}
      </div>
    );
  }
);

PlanCard.displayName = "PlanCard";

export default PlanCard;

export const FeatureRow = React.memo(({ features }: { features: string[] }) => {
  return (
    <div className="p-6 space-y-3">
      {features?.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
});

FeatureRow.displayName = "FeatureRow";
