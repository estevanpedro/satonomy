"use client";

import { WalletProvider } from "@/app/providers/ConnectProvider";
import Butterfly from "@/app/components/Butterfly";

import { RecoilRoot } from "recoil";

export default function Home() {
  return (
    <RecoilRoot>
      <WalletProvider>
        <main className="flex min-h-screen flex-col items-center justify-start">
          <Butterfly />
        </main>
      </WalletProvider>
    </RecoilRoot>
  );
}
