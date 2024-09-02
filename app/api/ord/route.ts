import { utxoServices } from "@/app/services/utxoServices";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const inscriptionId = query.get("inscriptionId");

    if (!inscriptionId) {
      return NextResponse.json(
        { error: "Missing required parameters: inscriptionId" },
        { status: 400 }
      );
    }

    const ordinals = await utxoServices.getOrdInfo(inscriptionId);

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
