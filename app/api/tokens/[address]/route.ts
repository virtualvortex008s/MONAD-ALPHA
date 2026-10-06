import { NextResponse } from "next/server";
import { mockTokens } from "@/data/mockTokens";
import { generateTokenIntelligence } from "@/lib/gemini";
import { getMonadBlockNumber } from "@/lib/monad";

export async function GET(
  _request: Request,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await context.params;
    const cleanAddress = address.toLowerCase();

    // Find token by address or symbol or id
    const token = mockTokens.find(
      (t) =>
        t.address.toLowerCase() === cleanAddress ||
        t.symbol.toLowerCase().replace("$", "") === cleanAddress ||
        t.id.toLowerCase() === cleanAddress
    );

    if (!token) {
      return NextResponse.json(
        { success: false, error: `Token not found for ${address}` },
        { status: 404 }
      );
    }

    const [intelligence, blockNumber] = await Promise.all([
      generateTokenIntelligence(token),
      getMonadBlockNumber(),
    ]);

    return NextResponse.json({
      success: true,
      blockNumber: blockNumber.toString(),
      token,
      intelligence,
    });
  } catch (error) {
    console.error("API /api/tokens/[address] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch token details" },
      { status: 500 }
    );
  }
}
