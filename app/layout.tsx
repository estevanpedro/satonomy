import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import "react-tooltip/dist/react-tooltip.css";
import "./globals.css";

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
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-start">
          {children}
        </main>
      </body>
    </html>
  );
}
