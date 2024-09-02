import { utxoServices } from "@/app/services/utxoServices";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const wallet = query.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { error: "Missing required parameters: account" },
        { status: 400 }
      );
    }

    const satributes = await utxoServices.getOrdInfoByWallet(wallet);

    return NextResponse.json(satributes, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
