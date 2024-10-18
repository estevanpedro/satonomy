import { psbtService } from "@/app/services/psbtService"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { butterfly, address, feeCost } = await request.json()

    if (!address || !butterfly || !feeCost) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: 'address' or 'butterfly' or 'feeCost'",
        },
        { status: 400 }
      )
    }

    const psbt = await psbtService.createPsbtFull(butterfly, address)
    if (psbt) {
      const virtualSize = psbtService.estimateTxSize(psbt)
      const feeRate = feeCost / virtualSize
      return NextResponse.json(feeRate, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    return NextResponse.json(
      {},
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Internal Server Error:", error)
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
