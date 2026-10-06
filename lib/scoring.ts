export interface TokenMetricsInput {
  volume24h: number;
  liquidity: number;
  change1h: number;
  change24h: number;
  smartWalletsCount: number;
  smartMoneyNetFlow: number;
  holderConcentrationTop10: number; // percentage e.g. 20 for 20%
  lpBurnedOrLocked: boolean;
  deployerHoldingPercent: number; // percentage e.g. 5 for 5%
  isHoneypotSafe: boolean;
  hasRenouncedOwnership: boolean;
}

/**
 * Calculates Alpha Score (0 - 100)
 * Weighted based on institutional on-chain momentum signals:
 * - Smart Wallet Accumulation (35%)
 * - Net Smart Money Flow Intensity (25%)
 * - Price Velocity & Momentum (20%)
 * - Liquidity Turnover Ratio (20%)
 */
export function calculateAlphaScore(stats: TokenMetricsInput): number {
  // 1. Smart Wallet Presence (Max 35 pts)
  // Scale from 0 to 100+ smart wallets
  const smartWalletsScore = Math.min(35, (stats.smartWalletsCount / 80) * 35);

  // 2. Smart Money Net Flow (Max 25 pts)
  // Positive net flow adds points, negative net flow subtracts
  let netFlowScore = 0;
  if (stats.smartMoneyNetFlow > 0) {
    netFlowScore = Math.min(25, (stats.smartMoneyNetFlow / 500000) * 25);
  } else {
    netFlowScore = Math.max(-15, (stats.smartMoneyNetFlow / 500000) * 15);
  }

  // 3. Price Velocity / Momentum (Max 20 pts)
  let momentumScore = 10; // Baseline
  if (stats.change1h > 0) {
    momentumScore += Math.min(10, (stats.change1h / 50) * 10);
  } else {
    momentumScore -= Math.min(10, (Math.abs(stats.change1h) / 30) * 10);
  }

  // 4. Volume / Liquidity Turnover (Max 20 pts)
  // Ideal ratio: healthy turnover without illiquid slippage
  const turnoverRatio = stats.liquidity > 0 ? stats.volume24h / stats.liquidity : 0;
  let turnoverScore = 0;
  if (turnoverRatio >= 1 && turnoverRatio <= 8) {
    turnoverScore = 20;
  } else if (turnoverRatio > 8) {
    turnoverScore = 14; // Ultra-high turnover may indicate churn
  } else {
    turnoverScore = Math.max(0, turnoverRatio * 20);
  }

  const rawTotal = smartWalletsScore + netFlowScore + momentumScore + turnoverScore;
  const clamped = Math.round(Math.max(1, Math.min(99, rawTotal)));

  return clamped;
}

/**
 * Calculates Risk Score (0 - 100)
 * Lower is safer, higher is riskier.
 * - Top 10 Holder Concentration (35%)
 * - Liquidity Lock / Burn Status (30%)
 * - Deployer Wallet Balance (20%)
 * - Contract Safety & Ownership (15%)
 */
export function calculateRiskScore(stats: TokenMetricsInput): number {
  let risk = 0;

  // 1. Holder Concentration (Max 35 pts of risk)
  // Concentration > 50% is extremely hazardous
  if (stats.holderConcentrationTop10 > 50) {
    risk += 35;
  } else if (stats.holderConcentrationTop10 > 30) {
    risk += 22;
  } else if (stats.holderConcentrationTop10 > 15) {
    risk += 10;
  } else {
    risk += 4;
  }

  // 2. LP Status (Max 30 pts of risk)
  if (!stats.lpBurnedOrLocked) {
    risk += 30; // Unlocked LP is high rug risk
  }

  // 3. Deployer Holdings (Max 20 pts of risk)
  if (stats.deployerHoldingPercent > 10) {
    risk += 20;
  } else if (stats.deployerHoldingPercent > 3) {
    risk += 10;
  } else {
    risk += 2;
  }

  // 4. Contract Safety (Max 15 pts of risk)
  if (!stats.isHoneypotSafe) {
    risk += 15;
  }
  if (!stats.hasRenouncedOwnership) {
    risk += 8;
  }

  return Math.round(Math.max(1, Math.min(99, risk)));
}
