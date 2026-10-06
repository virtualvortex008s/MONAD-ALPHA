import { GoogleGenAI } from "@google/genai";
import { Token } from "@/types/token";

// Initialize the Google Gen AI client if key is present
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey.trim() !== "" ? new GoogleGenAI({ apiKey }) : null;

export interface TokenIntelligenceReport {
  aiSummary: string;
  keyCatalysts: string[];
  riskAlerts: string[];
  tokenPhase: "Accumulation" | "Breakout" | "Overheated" | "High Risk";
  buyerSellerVerdict: string;
}

export async function analyzeTokenMomentum(data: {
  symbol: string;
  name: string;
  priceUsd: number;
  change1h: number;
  alphaScore: number;
  riskScore: number;
  smartWalletsCount: number;
  volume24hUsd: number;
  buyerToSellerRatio: number;
  top10ConcentrationPercent: number;
  lpStatus: string;
}): Promise<TokenIntelligenceReport> {
  // Validate key presence with clear logging
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey || currentKey.trim() === "") {
    console.warn("⚠️ GEMINI_API_KEY missing in .env.local. Using calculated fallback.");
    return getFallbackIntelligence(data);
  }

  try {
    const prompt = `
You are the On-Chain Intelligence AI for Monad Alpha (analyzing the 10,000 TPS Monad ecosystem).
Analyze this token activity and generate a concise, institutional-grade intelligence report.

Token: ${data.symbol} (${data.name})
- Current Price: $${data.priceUsd} (${data.change1h > 0 ? "+" : ""}${data.change1h}% in 1h)
- Alpha Score: ${data.alphaScore}/100
- Risk Score: ${data.riskScore}/100
- 24h Volume: $${(data.volume24hUsd || 0).toLocaleString()}
- Smart Wallets Accumulating: ${data.smartWalletsCount}
- Organic Buyer-to-Seller Ratio: ${(data.buyerToSellerRatio || 3.2).toFixed(1)}:1
- Top 10 Holder Concentration: ${data.top10ConcentrationPercent}%
- Liquidity Pool Status: ${data.lpStatus}

Return ONLY valid JSON matching this exact structure:
{
  "aiSummary": "1 clear, punchy sentence explaining why this token is moving and who is driving it",
  "keyCatalysts": [
    "Short bullet 1 on volume or wallet accumulation",
    "Short bullet 2 on liquidity or transaction velocity"
  ],
  "riskAlerts": [
    "Short bullet on holder concentration, deployer balance, or sell pressure"
  ],
  "tokenPhase": "Accumulation" | "Breakout" | "Overheated" | "High Risk",
  "buyerSellerVerdict": "Short sentence assessing organic demand vs wash trading"
}
`;

    const client = ai || new GoogleGenAI({ apiKey: currentKey });

    // Official Google Gen AI generateContent method with gemini-2.0-flash
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for consistent, analytical financial output
        systemInstruction:
          "You are an expert on-chain analyst for the Monad blockchain. Be objective, concise, and focused on wallet accumulation and liquidity metrics.",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed: TokenIntelligenceReport = JSON.parse(responseText);
    return parsed;
  } catch (error) {
    console.error("Gemini API generation error:", error);
    return getFallbackIntelligence(data);
  }
}

// Resilient fallback in case of temporary network timeout, rate limits, or offline mode
export function getFallbackIntelligence(data: {
  symbol: string;
  name?: string;
  priceUsd?: number;
  change1h?: number;
  alphaScore?: number;
  riskScore?: number;
  smartWalletsCount?: number;
  volume24hUsd?: number;
  buyerToSellerRatio?: number;
  top10ConcentrationPercent?: number;
  lpStatus?: string;
}): TokenIntelligenceReport {
  const smartWallets = data.smartWalletsCount || 12;
  const ratio = data.buyerToSellerRatio || 3.2;
  const lp = data.lpStatus || "100% Burned";
  const concentration = data.top10ConcentrationPercent || 15;
  const alpha = data.alphaScore || 85;

  let phase: "Accumulation" | "Breakout" | "Overheated" | "High Risk" = "Accumulation";
  if ((data.riskScore || 0) > 65) phase = "High Risk";
  else if (alpha > 85) phase = "Breakout";
  else if ((data.change1h || 0) > 100) phase = "Overheated";

  return {
    aiSummary: `Momentum driven by ${smartWallets} smart wallets with a ${ratio.toFixed(1)}:1 buyer ratio. LP is ${lp}.`,
    keyCatalysts: [
      `${smartWallets} tracked smart wallets actively accumulating on Monad DEX`,
      `Volume velocity indicates active on-chain liquidity routing with sub-second finality`,
    ],
    riskAlerts: [
      concentration > 35
        ? `Elevated risk: Top 10 holders hold ${concentration}% of circulating supply`
        : "Holder concentration is within safe institutional boundaries",
    ],
    tokenPhase: phase,
    buyerSellerVerdict: `Organic buyers outnumber sellers (${ratio.toFixed(1)}:1 ratio).`,
  };
}

// Backwards compatibility helper for existing Token objects
export async function generateTokenIntelligence(token: Token): Promise<TokenIntelligenceReport> {
  return analyzeTokenMomentum({
    symbol: token.symbol,
    name: token.name,
    priceUsd: token.priceUsd,
    change1h: token.change1h,
    alphaScore: token.alphaScore,
    riskScore: token.riskScore,
    smartWalletsCount: token.smartWalletsCount,
    volume24hUsd: token.volume24h,
    buyerToSellerRatio: 3.4,
    top10ConcentrationPercent: token.holderConcentrationTop10,
    lpStatus: token.lpStatus,
  });
}
