import { NextResponse } from "next/server";
import { getFilteredTokens } from "@/lib/tokens";
import { getMonadBlockNumber } from "@/lib/monad";

export const dynamic = "force-dynamic";
export const revalidate = 30; // Next.js ISR revalidation cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const [tokens, blockNumber] = await Promise.all([
      getFilteredTokens({ filter, search, limit }),
      getMonadBlockNumber(),
    ]);

    return NextResponse.json(
      {
        success: true,
        network: "Monad Testnet",
        chainId: 10143,
        blockNumber: blockNumber.toString(),
        timestamp: Date.now(),
        count: tokens.length,
        tokens,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("API /api/tokens error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dynamic tokens feed" },
      { status: 500 }
    );
  }
}
