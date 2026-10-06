import { NextResponse } from "next/server";
import { getMonadBlockNumber } from "@/lib/monad";
import { mockEcosystemStats } from "@/data/mockTokens";

export async function GET() {
  try {
    const blockNumber = await getMonadBlockNumber();

    return NextResponse.json({
      success: true,
      chainId: 10143,
      network: "Monad Testnet",
      blockNumber: blockNumber.toString(),
      tps: Math.floor(9800 + Math.random() * 450),
      avgFinalitySeconds: 0.82,
      volume24hUsd: mockEcosystemStats.volume24h,
      activeSmartWallets: mockEcosystemStats.activeSmartWallets,
      gasPriceMon: "<0.001 MON",
    });
  } catch (error) {
    console.error("API /api/ecosystem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ecosystem telemetry" },
      { status: 500 }
    );
  }
}
