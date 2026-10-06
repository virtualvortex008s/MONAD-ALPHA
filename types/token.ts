export interface CandleData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LineDataPoint {
  time: string;
  value: number;
}

export interface SmartAccumulator {
  walletAddress: string;
  tag: "Sniper" | "Smart Trader" | "Whale";
  winRate: number;
  accumulatedMon: number;
  accumulatedUsd: number;
  avgEntryUsd: number;
  pnlPercent: number;
  lastActive: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: string;
  priceUsd: number;
  priceMon: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  alphaScore: number;
  alphaDriver: string;
  riskScore: number;
  riskFactors: string[];
  smartMoneyNetFlow: number;
  smartWalletsCount: number;
  aiSummary: string;
  holderConcentrationTop10: number;
  lpStatus: string;
  deployerBalanceMon: number;
  deployerAddress: string;
  catalysts: string[];
  launchTimeAgo: string;
  isWatchlist?: boolean;
  candles5m: CandleData[];
  candles15m: CandleData[];
  candles1h: CandleData[];
  smartAccumulators: SmartAccumulator[];
}

export interface WalletTrade {
  id: string;
  walletAddress: string;
  walletTag: "Sniper" | "Smart Trader" | "Whale";
  winRate: number;
  tokenSymbol: string;
  tokenName: string;
  type: "BUY" | "SELL";
  amountMon: number;
  amountUsd: number;
  timestamp: string;
  txHash: string;
}

export interface EcosystemStats {
  volume24h: number;
  activeSmartWallets: number;
  topAlphaToken: string;
  topAlphaScore: number;
  avgFinality: number;
  tpsCurrent: number;
  gasMon: number;
}

export type FilterCategory =
  | "ALL"
  | "MOMENTUM"
  | "WHALES"
  | "SNIPERS"
  | "LOW_RISK"
  | "NEW_LAUNCHES";
