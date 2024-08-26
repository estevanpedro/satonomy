import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

import { Inter } from "next/font/google";
import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Satonomy - UTXO Management 🦋",
  description:
    "Visually create UTXOs and PSBTs. Add custom scripts and automate transactions for Bitcoin, Runes and Ordinals. Use non-custodial wallets like XVerse, Unisat, Magic Eden and OKX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className={cn(`font-sans antialiased`, inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
