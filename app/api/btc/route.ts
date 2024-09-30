import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    })

    console.log("✌️response --->", response)
    const data = await response.json()
    console.log("✌️data --->", data)

    return NextResponse.json(data.bitcoin.usd, {
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
