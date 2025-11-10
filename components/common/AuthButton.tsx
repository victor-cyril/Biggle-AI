"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const AuthButton = (props: {
  className?: string;
  inTitle?: string;
  outTitle?: string;
}) => {
  const { className, inTitle, outTitle } = props;
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSubmit = async () => {
    if (session?.user?.id) {
      router.push("/editor");
      return;
    }

    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/",
    });
  };

  return (
    <Button
      className={cn("w-full font-semibold", className)}
      onClick={handleSubmit}
    >
      {session?.user ? inTitle || "Launch Editor" : outTitle || "Sign In"}
    </Button>
  );
};

export default AuthButton;
