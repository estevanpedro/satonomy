"use client"

import React from "react"

import {
  ConnectProvider,
  OKXConnector,
  UnisatConnector,
  BitgetConnector,
  TokenPocketConnector,
  BybitConnector,
  WizzConnector,
  XverseConnector,
} from "@particle-network/btc-connectkit"

import { Merlin, BEVM, MAPProtocol } from "@particle-network/chains"

class MeConnector extends XverseConnector {
  readonly metadata = {
    id: "me",
    name: "Magic Eden Wallet",
    icon: "https://play-lh.googleusercontent.com/F1JXB_LatQEoGQ5wvba5ab1IEdEChxlU5jl-5_eW4aiLZ-2cNYP1kvNsscWyGPxT8g",
    downloadUrl: "https://wallet.magiceden.io/download",
  }
}
export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectProvider
      options={{
        projectId: `${process.env.NEXT_PUBLIC_PROJECT_ID}`,
        clientKey: `${process.env.NEXT_PUBLIC_CLIENT_KEY}`,
        appId: `${process.env.NEXT_PUBLIC_APP_APP_ID}`,
        aaOptions: {
          accountContracts: {
            BTC: [
              {
                chainIds: [Merlin.id, BEVM.id, MAPProtocol.id],
                version: "1.0.0",
              },
            ],
          },
        },
        walletOptions: {
          visible: false,
          preload: false,
        },
      }}
      connectors={[
        new XverseConnector(),
        new MeConnector(),
        new UnisatConnector(),
        new OKXConnector(),
        new BybitConnector(),
        new WizzConnector(),
        new BitgetConnector(),
        new TokenPocketConnector(),
      ]}
    >
      {children}
    </ConnectProvider>
  )
}
