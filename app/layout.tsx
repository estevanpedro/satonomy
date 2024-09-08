import "react-tooltip/dist/react-tooltip.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Satonomy - UTXO Management 🦋",
  description:
    "Optimize and unlock the sats in your wallet. Manage Bitcoin transactions, Runes, and Ordinals. Use wallets like Unisat, XVerse, OKX, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-start">
          {children}
        </main>
      </body>
    </html>
  );
}
