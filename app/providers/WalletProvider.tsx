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
        new UnisatConnector(),
        new OKXConnector(),
        new BitgetConnector(),
        new TokenPocketConnector(),
        new BybitConnector(),
        new WizzConnector(),
        new XverseConnector(),
      ]}
    >
      {children}
    </ConnectProvider>
  )
}
