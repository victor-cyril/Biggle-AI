import type { Metadata } from "next";

import "./globals.css";
import Providers from "@/providers";
import { Poppins, QuickSand } from "@/lib/customFonts";

export const metadata: Metadata = {
  title: "Biggle AI Agent",
  description: "An AI agent that helps you manage your tasks efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${Poppins.variable} ${Poppins.className} ${QuickSand.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
