import { NextResponse } from "next/server";
import { mockTokens } from "@/data/mockTokens";
import { calculateAlphaScore, calculateRiskScore } from "@/lib/scoring";
import { getMonadBlockNumber } from "@/lib/monad";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const blockNumber = await getMonadBlockNumber();

    // Re-score dynamically using the mathematical engine
    const scoredTokens = mockTokens.map((t) => {
      const alpha = calculateAlphaScore({
        volume24h: t.volume24h,
        liquidity: t.liquidity,
        change1h: t.change1h,
        change24h: t.change24h,
        smartWalletsCount: t.smartWalletsCount,
        smartMoneyNetFlow: t.smartMoneyNetFlow,
        holderConcentrationTop10: t.holderConcentrationTop10,
        lpBurnedOrLocked: t.lpStatus.toLowerCase().includes("burn") || t.lpStatus.toLowerCase().includes("lock"),
        deployerHoldingPercent: t.deployerBalanceMon > 100 ? 12 : 2,
        isHoneypotSafe: t.riskScore < 70,
        hasRenouncedOwnership: t.deployerAddress.toLowerCase().includes("dead") || t.riskScore < 40,
      });

      const risk = calculateRiskScore({
        volume24h: t.volume24h,
        liquidity: t.liquidity,
        change1h: t.change1h,
        change24h: t.change24h,
        smartWalletsCount: t.smartWalletsCount,
        smartMoneyNetFlow: t.smartMoneyNetFlow,
        holderConcentrationTop10: t.holderConcentrationTop10,
        lpBurnedOrLocked: t.lpStatus.toLowerCase().includes("burn") || t.lpStatus.toLowerCase().includes("lock"),
        deployerHoldingPercent: t.deployerBalanceMon > 100 ? 12 : 2,
        isHoneypotSafe: t.riskScore < 70,
        hasRenouncedOwnership: t.deployerAddress.toLowerCase().includes("dead") || t.riskScore < 40,
      });

      return {
        ...t,
        alphaScore: alpha,
        riskScore: risk,
      };
    });

    let result = scoredTokens;
    if (filter === "MOMENTUM") {
      result = result.filter((t) => t.change1h > 20 || t.alphaScore >= 80);
    } else if (filter === "WHALES") {
      result = result.filter((t) => t.smartMoneyNetFlow > 200000 || t.alphaDriver.includes("Whale"));
    } else if (filter === "SNIPERS") {
      result = result.filter((t) => t.smartWalletsCount > 40 || t.alphaDriver.includes("Sniper"));
    } else if (filter === "LOW_RISK") {
      result = result.filter((t) => t.riskScore <= 25);
    }

    return NextResponse.json({
      success: true,
      blockNumber: blockNumber.toString(),
      count: result.length,
      tokens: result,
    });
  } catch (error) {
    console.error("API /api/tokens error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tokens" }, { status: 500 });
  }
}
