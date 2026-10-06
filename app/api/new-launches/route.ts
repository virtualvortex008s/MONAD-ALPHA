import { NextResponse } from "next/server";
import { mockTokens } from "@/data/mockTokens";

export async function GET() {
  try {
    const launches = mockTokens
      .filter((t) => t.launchTimeAgo.includes("h ago") || t.launchTimeAgo.includes("m ago"))
      .map((t) => ({
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        address: t.address,
        priceUsd: t.priceUsd,
        change1h: t.change1h,
        liquidity: t.liquidity,
        volume24h: t.volume24h,
        launchTimeAgo: t.launchTimeAgo,
        alphaScore: t.alphaScore,
        riskScore: t.riskScore,
        auditChecklist: {
          honeypotPassed: t.riskScore < 70,
          lpLocked: t.lpStatus.toLowerCase().includes("lock") || t.lpStatus.toLowerCase().includes("burn"),
          lpStatus: t.lpStatus,
          devHoldingPercent: t.deployerBalanceMon > 100 ? 12 : 2.1,
          renouncedOwnership: t.deployerAddress.toLowerCase().includes("dead") || t.riskScore < 40,
          verifiedBytecode: true,
        },
      }));

    return NextResponse.json({
      success: true,
      count: launches.length,
      launches,
    });
  } catch (error) {
    console.error("API /api/new-launches error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch new launches" },
      { status: 500 }
    );
  }
}
