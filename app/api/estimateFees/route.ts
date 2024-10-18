import { psbtService } from "@/app/services/psbtService"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { newButterfly, address, feeRate } = await request.json()

    if (!address || !newButterfly || !feeRate) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: 'address' or 'newButterfly' or 'feeRate'",
        },
        { status: 400 }
      )
    }

    if (newButterfly?.inputs?.length === 0) {
      return NextResponse.json(0, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    const psbt = await psbtService.createPsbtFull(newButterfly, address)
    console.log("✌️psbt --->", psbt)
    if (psbt) {
      const feeCost = psbtService.calculateTransactionFee(psbt, feeRate)
      return NextResponse.json(feeCost, {
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
