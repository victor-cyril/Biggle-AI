import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import Logo from "./logo";

type Props = {
  subHeading?: string;
  heading: string;
  description?: string;
  variant?: ButtonProps["variant"];
};

const InfoComponent = (props: Props) => {
  const variant = props.variant || "default";
  const isDefault = variant === "default";
  const isDestructive = variant === "destructive";
  const fillColor = isDestructive
    ? "rgb(248, 113, 113)"
    : isDefault
    ? "var(--primary)"
    : "";

  return (
    <main className="flex h-dvh flex-col bg-background px-4 sm:px-8 w-full items-center justify-center">
      <section className="flex flex-col relative gap-y-8 items-center -mt-12">
        <div
          className={cn(
            "absolute -top-10 -left-6 sm:-top-16 blur-xl bg-linear-to-r rounded-full size-40 sm:size-52",
            {
              "from-primary/20 to-primary/30": isDefault,
              "from-rose-600/30 to-rose-400/30": isDestructive,
            }
          )}
        />
        {!!props.subHeading && (
          <h2
            className={cn("text-lg sm:text-3xl font-semibold  text-center", {
              "text-primary-light": isDefault,
              "text-red-400": isDestructive,
            })}
          >
            {props.subHeading}
          </h2>
        )}

        <div className="sm:border-l sm:border-gray-700 sm:pl-6 text-center space-y-3">
          <h1 className="text-lg sm:text-4xl font-bold text-foreground tracking-tight max-w-prose">
            {props.heading}
          </h1>
          {!!props?.description && (
            <p className="text-sm sm:text-lg text-slate-300">
              {props.description}
            </p>
          )}
        </div>
        <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
          <Link
            href={"/"}
            className={buttonVariants({
              variant: isDestructive ? "destructive" : "outline",
            })}
          >
            Go back home
          </Link>
        </div>
      </section>

      <div className="mt-10">
        <svg
          className="mx-auto"
          width="164"
          height="24"
          viewBox="0 0 164 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12H158"
            stroke="#4B5563"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 6"
          />
          <circle cx="6" cy="12" r="6" fill={fillColor} />
          <circle cx="158" cy="12" r="6" fill={fillColor} />
        </svg>
      </div>

      <div className="my-8 sm:my-16 w-full flex items-center  justify-center">
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <Sparkles
              fill="transparent"
              className="size-8 text-primary animate-glow-pulse"
            />
            <div className="absolute inset-0 size-8 text-secondary animate-glow-pulse opacity-50" />
          </div>
          <Logo />
        </motion.div>
      </div>
    </main>
  );
};

export default InfoComponent;
