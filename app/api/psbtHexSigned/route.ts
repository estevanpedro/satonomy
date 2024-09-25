import { psbtService } from "@/app/services/psbtService"
import { utxoServices } from "@/app/services/utxoServices"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export type PsbtHexSignedRes =
  | {
      signedIndexes: number[]
      btcTxHex: undefined
    }
  | {
      signedIndexes: number[]
      btcTxHex: string
    }
  | null

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { psbtHexSigned } = body

    if (!psbtHexSigned) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const psbtHex = await utxoServices.psbtHexSigned(psbtHexSigned)

    return NextResponse.json(psbtHex, {
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
