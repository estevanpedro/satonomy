import "react-tooltip/dist/react-tooltip.css"

import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import { Inter } from "next/font/google"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),

  title: "Satonomy - UTXO Management",
  description:
    "Optimize and unlock the sats in your wallet. Manage Bitcoin transactions, Runes, and Ordinals.",
  openGraph: {
    title: "Satonomy - UTXO Management",
    description:
      "Optimize and unlock the sats in your wallet. Manage Bitcoin transactions, Runes, and Ordinals.",
    url: "https://satonomy.io",
    siteName: "Satonomy",
    images: [
      {
        url: "/twitter-image.png", // Ensure this path points to the image in your public folder
        width: 1200,
        height: 630,
        alt: "Satonomy UTXO Management Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satonomy - UTXO Management",
    description:
      "Optimize and unlock the sats in your wallet. Manage Bitcoin transactions, Runes, and Ordinals.",
    images: ["/twitter-image.png"], // Ensure this path points to the image in your public folder
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
  )
}
