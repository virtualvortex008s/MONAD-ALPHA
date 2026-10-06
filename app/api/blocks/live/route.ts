import { NextResponse } from "next/server";
import { getLatestMonadBlock, MONAD_TESTNET_CONFIG } from "@/lib/monad";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const blockData = await getLatestMonadBlock(true);

    if (!blockData) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to query block from Monad Testnet RPC",
          rpcUrl: MONAD_TESTNET_CONFIG.rpcUrl,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        chainId: MONAD_TESTNET_CONFIG.chainId,
        network: MONAD_TESTNET_CONFIG.chainName,
        block: blockData,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("API /api/blocks/live error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error querying Monad Testnet block" },
      { status: 500 }
    );
  }
}
