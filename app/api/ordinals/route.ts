import { utxoServices } from "@/app/services/utxoServices";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const account = query.get("account");

    if (!account) {
      return NextResponse.json(
        { error: "Missing required parameters: account" },
        { status: 400 }
      );
    }

    const ordinals = await utxoServices.getInscriptions(account);

    return NextResponse.json(ordinals, {
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
