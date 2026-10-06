import { NextRequest, NextResponse } from "next/server";
import { analyzeTokenMomentum } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const tokenData = await req.json();

    if (!tokenData || !tokenData.symbol) {
      return NextResponse.json({ error: "Missing token data" }, { status: 400 });
    }

    const analysis = await analyzeTokenMomentum(tokenData);
    return NextResponse.json(analysis);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    console.error("Token analysis route error:", error);
    return NextResponse.json(
      { error: "Failed to generate token intelligence", details: errMessage },
      { status: 500 }
    );
  }
}
