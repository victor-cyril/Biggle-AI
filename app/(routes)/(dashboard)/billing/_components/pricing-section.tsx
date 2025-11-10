"use client";
import {
  useCheckGenerations,
  useUpgradeSubscription,
} from "@/hooks/use-subscription";
import { PAID_PLAN_ENUM_TYPE, POLAR_PLANS } from "@/lib/polar/plans";
import PlanCard, { FeatureRow } from "./plan-card";

const PricingSection = () => {
  const {
    data: subscription,
    isPending,
    isError,
    error,
  } = useCheckGenerations();
  const { mutate, isPending: isUpgrading } = useUpgradeSubscription();

  const onUpgrade = (plan: PAID_PLAN_ENUM_TYPE) => {
    if (isUpgrading) return;
    mutate({
      plan: plan,
      callbackUrl: `${window.location.origin}/billing`,
    });
  };

  return (
    <div>
      <div className="w-full pl-3 mt-16 mb-1">
        <h2 className="text-lg lg:text-xl font-medium">All plans</h2>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-4 border-b">
          <div className="lg:p-6"></div>
          {POLAR_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              subscription={subscription}
              loading={isPending}
              error={isError ? error?.message ?? "Failed to load" : null}
              isUpgrading={isUpgrading}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>

        <div className="grid grid-cols-4 bg-gray-50/80 dark:bg-secondary/40 min-h-56 pb-5">
          <div className="p-6">
            <h4 className="font-medium">Highlights</h4>
          </div>
          {POLAR_PLANS.map((plan) => {
            return <FeatureRow key={plan.name} features={plan.features} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
