import { utxoServices } from "@/app/services/utxoServices"

import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams
    const account = query.get("account")

    if (!account) {
      return NextResponse.json(
        { error: "Missing required parameters: account" },
        { status: 400 }
      )
    }

    const runesBalances = await utxoServices.getRunesBalances(account)

    const runesUtxos = await Promise.all(
      runesBalances.map(async (rune) => {
        const utxos = await utxoServices.getRunesUTXOs(account, rune.rune)
        return {
          ...rune,
          utxos,
        }
      })
    )

    return NextResponse.json(runesUtxos, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
