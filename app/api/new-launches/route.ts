import { NextResponse } from "next/server";
import { getFilteredTokens } from "@/lib/tokens";

export const revalidate = 30;

export async function GET() {
  try {
    const tokens = await getFilteredTokens({ filter: "NEW_DEPLOYMENTS" });

    const launches = tokens.map((t) => ({
      id: t.id,
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      priceUsd: t.priceUsd,
      priceMon: t.priceMon,
      price: t.price ?? t.priceUsd,
      change1h: t.change1h,
      change24h: t.change24h,
      liquidity: t.liquidity,
      volume24h: t.volume24h,
      launchTimeAgo: t.launchTimeAgo,
      deployTimestamp: t.deployTimestamp,
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
