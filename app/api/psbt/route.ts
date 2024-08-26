import { psbtService } from "@/app/services/psbtService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { butterfly, account } = body;

    if (!butterfly || !account) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const psbtHex = await psbtService.createPsbt(butterfly, account);

    return NextResponse.json(
      { psbtHex },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
