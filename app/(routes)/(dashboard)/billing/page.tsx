import React from "react";
import Header from "../_components/header";
import PricingSection from "./_components/pricing-section";

const Billing = () => {
  return (
    <>
      <Header title="Billings" />
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full">
          <PricingSection />
        </div>
      </div>
    </>
  );
};

export default Billing;
