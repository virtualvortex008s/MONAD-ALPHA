export type DicePrediction = "EVEN" | "ODD";

export interface ProvableFairProof {
  clientSeed: string;
  timestamp: number;
  blockHash: string;
  blockNumber: number;
  combinedHash: string;
}

export interface DiceRollResult {
  id: string;
  timestamp: number;
  die1: number;
  die2: number;
  sum: number;
  prediction: DicePrediction;
  isWin: boolean;
  wager: number;
  payout: number;
  proof: ProvableFairProof;
}

export type PriceDirection = "HIGHER" | "LOWER";

export interface PricePredictionRound {
  id: string;
  pair: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  lockPrice: number;
  finalPrice?: number;
  direction: PriceDirection;
  wager: number;
  payout: number;
  isWin?: boolean;
  status: "ACTIVE" | "SETTLED";
}

export interface PricePoint {
  time: number;
  price: number;
}

/**
 * Computes a SHA-256 hash string for provable fairness using the Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple deterministic hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "a");
}

/**
 * Deterministically calculates two dice (1-6 each) using Provably Fair inputs:
 * User Address + Client Timestamp + Monad Block Hash
 */
export async function calculateProvablyFairDice(
  userAddress: string,
  timestamp: number,
  blockHash: string,
  blockNumber: number
): Promise<{ die1: number; die2: number; sum: number; proof: ProvableFairProof }> {
  const normalizedAddress = userAddress.toLowerCase();
  const rawSeed = `${normalizedAddress}:${timestamp}:${blockHash}:${blockNumber}`;
  const combinedHash = await sha256(rawSeed);

  // Take 4-byte segments from the hash to derive dice values cleanly
  const hex1 = combinedHash.slice(0, 8);
  const hex2 = combinedHash.slice(8, 16);

  const num1 = parseInt(hex1, 16);
  const num2 = parseInt(hex2, 16);

  const die1 = (num1 % 6) + 1;
  const die2 = (num2 % 6) + 1;
  const sum = die1 + die2;

  return {
    die1,
    die2,
    sum,
    proof: {
      clientSeed: userAddress,
      timestamp,
      blockHash,
      blockNumber,
      combinedHash,
    },
  };
}

/**
 * Price prediction asset pairs config
 */
export const ASSET_PAIRS = [
  {
    symbol: "MON/USD",
    name: "Monad Native",
    basePrice: 1.764,
    minDecimals: 4,
    volatility: 0.0018,
  },
  {
    symbol: "WMON/USDC",
    name: "Wrapped Monad",
    basePrice: 1.761,
    minDecimals: 4,
    volatility: 0.0015,
  },
  {
    symbol: "CHOG/MON",
    name: "Chog Memecoin",
    basePrice: 0.0482,
    minDecimals: 5,
    volatility: 0.0035,
  },
];
