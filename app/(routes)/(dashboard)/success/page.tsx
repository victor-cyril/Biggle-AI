"use client";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import AuthButton from "@/components/common/AuthButton";

import { useSearchParams } from "next/navigation";
import InfoComponent from "@/components/common/InfoComponent";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  if (!checkoutId) {
    return (
      <InfoComponent
        heading="Invalid access to this page"
        variant={"destructive"}
        description="You are accessing this page wrongly"
      />
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 size-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 size-96 bg-secondary/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "-1s" }}
      />

      <div className="container mx-auto px-4 flex flex-col items-center justify-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-glass rounded-2xl p-10 md:p-16 shadow-glow-subtle border border-card-border max-w-xl w-full text-center"
        >
          <CheckCircle2 className="mx-auto mb-6 text-green-500" size={64} />
          <h1 className="text-base md:text-2xl font-bold mb-4">
            Payment Successful!
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Thank you for your purchase. Your checkout was successful and your
            account has been upgraded.
            <br />
            You can now enjoy all premium features.
          </p>
          <Link href="/billing" className={buttonVariants()}>
            Go to billing
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessPage;
