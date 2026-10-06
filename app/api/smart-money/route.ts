import { NextResponse } from "next/server";
import { mockTrades, mockTokens } from "@/data/mockTokens";

export async function GET() {
  try {
    // Aggregate accumulator wallets into a comprehensive leaderboard
    const allAccumulators = mockTokens.flatMap((t) =>
      t.smartAccumulators.map((acc) => ({
        ...acc,
        favoriteToken: t.symbol,
        tokenAddress: t.address,
      }))
    );

    // Sort by win rate and USD volume
    const sortedLeaderboard = [...allAccumulators].sort((a, b) => b.winRate - a.winRate);

    return NextResponse.json({
      success: true,
      trackedWalletsCount: 1482,
      leaderboard: sortedLeaderboard,
      recentWhaleSwaps: mockTrades,
    });
  } catch (error) {
    console.error("API /api/smart-money error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch smart money data" },
      { status: 500 }
    );
  }
}
