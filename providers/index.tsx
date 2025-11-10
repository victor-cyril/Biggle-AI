"use client";

import React, { ReactNode } from "react";
import QueryProvider from "./query-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" duration={3000} richColors />
        </ThemeProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
};

export default Providers;
