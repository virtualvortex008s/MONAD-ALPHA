"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { mockTokens } from "@/data/mockTokens";
import { Token } from "@/types/token";
import { TokenIntelligenceReport } from "@/lib/gemini";
import { MiniChart } from "@/components/MiniChart";
import { MonadLogo } from "@/components/MonadLogo";
import { executeMonToTokenSwap } from "@/lib/swap";
import {
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  Users,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface TokenPageProps {
  params: Promise<{ address: string }>;
}

export default function TokenDeepDivePage({ params }: TokenPageProps) {
  const resolvedParams = use(params);
  const tokenAddress = resolvedParams.address.toLowerCase();

  // Find token by address or id or symbol
  const foundToken = mockTokens.find(
    (t) =>
      t.address.toLowerCase() === tokenAddress ||
      t.id.toLowerCase() === tokenAddress ||
      t.symbol.toLowerCase().replace("$", "") === tokenAddress
  );

  // Fallback to first token if not found
  const token: Token = foundToken || {
    ...mockTokens[0],
    address: tokenAddress.startsWith("0x") ? tokenAddress : mockTokens[0].address,
  };

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [swapAmount, setSwapAmount] = useState<string>("0.05");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatusText, setSwapStatusText] = useState("");
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [aiReport, setAiReport] = useState<TokenIntelligenceReport>({
    aiSummary: token.aiSummary,
    keyCatalysts: token.catalysts,
    riskAlerts: token.riskFactors,
    tokenPhase: token.alphaScore > 85 ? "Breakout" : "Accumulation",
    buyerSellerVerdict: "Organic buyers outnumber sellers (3.4:1 ratio).",
  });

  useEffect(() => {
    let ignore = false;

    fetch("/api/ai/token-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    })
      .then((res) => res.json())
      .then((data: TokenIntelligenceReport) => {
        if (!ignore && data && data.aiSummary) {
          setAiReport(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch live AI intelligence:", err);
      });

    return () => {
      ignore = true;
    };
  }, [
    token.address,
    token.alphaScore,
    token.change1h,
    token.holderConcentrationTop10,
    token.lpStatus,
    token.name,
    token.priceUsd,
    token.riskScore,
    token.smartWalletsCount,
    token.symbol,
    token.volume24h,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(token.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleExecuteSwap = async () => {
    setIsSwapping(true);
    setSwapError(null);
    setSwapTxHash(null);
    setSwapStatusText("Verifying Monad Testnet connection...");

    const res = await executeMonToTokenSwap({
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      amountMon: swapAmount,
      onStatusUpdate: (status) => setSwapStatusText(status),
    });

    setIsSwapping(false);
    if (res.success && res.txHash) {
      setSwapTxHash(res.txHash);
    } else {
      setSwapError(res.error || "Swap failed on Monad Testnet.");
    }
  };

  const handleRefreshAi = () => {
    setIsAiRefreshing(true);
    fetch("/api/ai/token-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    })
      .then((res) => res.json())
      .then((data: TokenIntelligenceReport) => {
        if (data && data.aiSummary) {
          setAiReport(data);
        }
      })
      .catch((err) => console.error("Failed to refresh AI intelligence:", err))
      .finally(() => setIsAiRefreshing(false));
  };

  const isPositive1h = token.change1h >= 0;
  const isPositive24h = token.change24h >= 0;

  const estimatedTokensReceived =
    parseFloat(swapAmount || "0") > 0
      ? (parseFloat(swapAmount) * 4.2) / token.priceUsd
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Quick Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Alpha Radar</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Live Monad Testnet Feed
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Token Identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7053F5] to-[#5035E4] font-mono text-2xl font-black text-white shadow-[0_0_25px_rgba(112, 83, 245,0.4)]">
              {token.symbol.replace("$", "").slice(0, 3)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {token.symbol}
                </h1>
                <span className="text-base text-slate-400 font-medium">
                  {token.name}
                </span>
                <span className="rounded-md border border-[#7053F5]/40 bg-[#7053F5]/15 px-2.5 py-0.5 font-mono text-xs font-bold text-[#7053F5]">
                  {token.alphaDriver}
                </span>
              </div>

              {/* Address & Explorer */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md bg-[#191C27] px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
                >
                  <span>{token.address}</span>
                  {copiedAddress ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <a
                  href={`https://testnet.monadexplorer.com/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-[#7053F5] transition-colors"
                >
                  <span>MonadScan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">Launched {token.launchTimeAgo}</span>
              </div>
            </div>
          </div>

          {/* Price & Scores Strip */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Price */}
            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 text-right min-w-[140px]">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">USD Price</span>
              <div className="font-mono text-xl font-black text-white">
                ${token.priceUsd < 0.001 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                <MonadLogo size={12} />
                <span>{token.priceMon} MON</span>
              </div>
            </div>

            {/* 1h & 24h Change */}
            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 min-w-[120px]">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Performance</span>
              <div
                className={`font-mono text-sm font-bold flex items-center gap-1 ${
                  isPositive1h ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive1h ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span>1h: {token.change1h >= 0 ? "+" : ""}{token.change1h.toFixed(1)}%</span>
              </div>
              <div
                className={`font-mono text-xs font-bold ${
                  isPositive24h ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                24h: {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(1)}%
              </div>
            </div>

            {/* Alpha Score */}
            <div className="rounded-xl border border-[#7053F5]/40 bg-[#7053F5]/10 p-3 text-center min-w-[90px]">
              <span className="text-[10px] text-[#7053F5] font-mono font-bold block uppercase">Alpha Score</span>
              <div className="font-mono text-2xl font-black text-white">{token.alphaScore}</div>
              <span className="text-[10px] text-[#7053F5]/80 font-mono">/ 100</span>
            </div>

            {/* Risk Score */}
            <div
              className={`rounded-xl border p-3 text-center min-w-[90px] ${
                token.riskScore < 40
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : token.riskScore < 70
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-400"
              }`}
            >
              <span className="text-[10px] font-mono font-bold block uppercase opacity-80">Risk Score</span>
              <div className="font-mono text-2xl font-black">{token.riskScore}</div>
              <span className="text-[10px] font-mono opacity-75">
                {token.riskScore < 40 ? "LOW" : token.riskScore < 70 ? "MEDIUM" : "HIGH"}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 h-52 w-52 rounded-full bg-[#7053F5]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Chart + AI Dossier + Tokenomics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Interactive Chart Container */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#7053F5]" />
                <h2 className="text-base font-bold text-white">Monad Testnet Candlestick Chart</h2>
              </div>
              <span className="font-mono text-xs text-slate-500">1s Block Finality</span>
            </div>

            {/* Candlestick Component with built-in timeframe switcher */}
            <div className="w-full">
              <MiniChart
                candles5m={token.candles5m}
                candles15m={token.candles15m}
                candles1h={token.candles1h}
                symbol={token.symbol}
                priceUsd={token.priceUsd}
              />
            </div>
          </div>

          {/* AI Intelligence Dossier (Gemini Flash) */}
          <div className="relative overflow-hidden rounded-2xl border border-[#7053F5]/40 bg-gradient-to-br from-[#151226] via-[#12141C] to-[#12141C] p-6 shadow-2xl">
            {isAiRefreshing && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#7053F5]/40 bg-[#7053F5]/15 px-3 py-2 text-xs font-mono text-[#7053F5] animate-pulse">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-[#7053F5]" />
                <span className="font-semibold">Generating Gemini 2.0 Flash Intelligence...</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-[#7053F5]/20 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7053F5]/20 text-[#7053F5]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Gemini Flash AI Intelligence Dossier
                    </h3>
                    <span className="rounded bg-[#7053F5]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/30">
                      gemini-2.0-flash
                    </span>
                    {aiReport.tokenPhase && (
                      <span className="rounded bg-[#7053F5]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/30">
                        Phase: {aiReport.tokenPhase}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time synthesis of Monad mempool dynamics, whale positioning, and smart contract safety
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefreshAi}
                disabled={isAiRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-[#1E2230] bg-[#0E1017] px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                title="Re-run AI Analysis"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isAiRefreshing ? "animate-spin text-[#7053F5]" : ""}`} />
                <span className="hidden sm:inline">Refresh Analysis</span>
              </button>
            </div>

            {/* AI Summary Text */}
            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017]/80 p-4">
              <p className="text-sm leading-relaxed text-slate-200">
                {aiReport.aiSummary}
              </p>
            </div>

            {/* Buyer / Seller Organic Verdict */}
            {aiReport.buyerSellerVerdict && (
              <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 font-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{aiReport.buyerSellerVerdict}</span>
              </div>
            )}

            {/* 2-Col Insights: Key Catalysts vs Risk Factors */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Catalysts */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">Bullish Catalysts</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {aiReport.keyCatalysts.map((cat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">Security & Risk Flags</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {aiReport.riskAlerts.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* On-Chain Metrics & Tokenomics */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">On-Chain Verification & Liquidity Specs</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">DEX Pair V2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
                <span className="text-slate-500 block text-[10px]">Total Liquidity</span>
                <span className="text-sm font-black text-white">${(token.liquidity / 1000).toFixed(1)}k</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">≈ {(token.liquidity / 4.2).toFixed(0)} MON</span>
              </div>
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
                <span className="text-slate-500 block text-[10px]">24h Volume</span>
                <span className="text-sm font-black text-white">${(token.volume24h / 1000).toFixed(1)}k</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">High Velocity</span>
              </div>
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
                <span className="text-slate-500 block text-[10px]">Smart Inflow</span>
                <span className="text-sm font-black text-emerald-400">+${(token.smartMoneyNetFlow / 1000).toFixed(1)}k</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{token.smartWalletsCount} Wallets</span>
              </div>
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
                <span className="text-slate-500 block text-[10px]">LP Lock Status</span>
                <span className="text-sm font-black text-emerald-400">{token.lpStatus}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Zero Rug Risk</span>
              </div>
            </div>

            {/* Holder Concentration Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Top 10 Holder Concentration</span>
                <span className="font-mono font-bold text-white">{token.holderConcentrationTop10}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1E2230]">
                <div
                  className={`h-full rounded-full ${
                    token.holderConcentrationTop10 < 20
                      ? "bg-emerald-500"
                      : token.holderConcentrationTop10 < 40
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, token.holderConcentrationTop10)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Healthy Distribution (&lt;25%)</span>
                <span>Dev holding: {token.deployerBalanceMon > 100 ? "12.4%" : "2.1%"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Interactive Swap Simulator + Smart Accumulators */}
        <div className="space-y-8">
          {/* Swap Simulator Card */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#7053F5]" />
                <h3 className="font-bold text-white text-sm">Monad DEX Instant Swap</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                1s Execution
              </span>
            </div>

            <div className="space-y-4">
              {/* Pay MON */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">You Pay</label>
                <div className="flex items-center justify-between rounded-xl border border-[#1E2230] bg-[#0E1017] px-4 py-3">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-28 bg-transparent font-mono text-lg font-bold text-white focus:outline-none"
                    placeholder="0.0"
                  />
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#191C27] px-2.5 py-1 text-xs font-mono font-bold text-white">
                    <MonadLogo size={14} />
                    <span>MON</span>
                  </div>
                </div>
              </div>

              {/* Receive Token */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">You Receive (Estimated)</label>
                <div className="flex items-center justify-between rounded-xl border border-[#1E2230] bg-[#0E1017] px-4 py-3">
                  <div className="font-mono text-lg font-bold text-emerald-400">
                    {estimatedTokensReceived > 0 ? estimatedTokensReceived.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0"}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#191C27] px-2.5 py-1 text-xs font-mono font-bold text-white">
                    <span>{token.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Slippage & Gas info */}
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017]/60 p-3 space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Routing:</span>
                  <span className="text-slate-200">Monad Native DEX AMM</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Cost:</span>
                  <span className="text-emerald-400">&lt;0.0004 MON ($0.001)</span>
                </div>
                <div className="flex justify-between">
                  <span>Finality:</span>
                  <span className="text-[#7053F5]">1 Second Guaranteed</span>
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleExecuteSwap}
                disabled={isSwapping}
                className="w-full rounded-xl bg-[#7053F5] py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(112, 83, 245,0.4)] transition-all hover:bg-[#725aeb] active:scale-[0.98] disabled:opacity-75 cursor-pointer"
              >
                {isSwapping ? "Executing on Monad Testnet..." : `Swap ${swapAmount || "0"} MON for ${token.symbol}`}
              </button>

              {/* Status banner */}
              {isSwapping && (
                <div className="rounded-xl border border-[#7053F5]/40 bg-[#7053F5]/10 p-3 text-center text-xs font-mono text-[#7053F5] animate-pulse flex items-center justify-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#7053F5]" />
                  <span>{swapStatusText}</span>
                </div>
              )}

              {/* Success receipt with live explorer link */}
              {swapTxHash && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2 text-xs font-mono text-emerald-400 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Swap Confirmed on Monad!
                    </span>
                    <span className="text-[10px] text-emerald-300">1s Finality</span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">Tx: {swapTxHash}</div>
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${swapTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7053F5] hover:text-white underline pt-1"
                  >
                    <span>View on Monad Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Error banner */}
              {swapError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-400 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{swapError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Accumulators Table */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#7053F5]" />
                <h3 className="font-bold text-white text-sm">Smart Accumulators</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{token.smartAccumulators.length} Tracked</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {token.smartAccumulators.map((acc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 transition-colors hover:border-[#7053F5]/40"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/wallet/${acc.walletAddress}`}
                      className="font-bold text-white hover:text-[#7053F5] transition-colors flex items-center gap-1"
                    >
                      <span>{acc.walletAddress}</span>
                      <ExternalLink className="h-3 w-3 text-slate-500" />
                    </Link>
                    <span className="rounded bg-[#7053F5]/20 px-2 py-0.5 text-[10px] font-bold text-[#7053F5]">
                      {acc.tag}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Accumulated</span>
                      <span className="text-white font-bold">{acc.accumulatedMon.toLocaleString()} MON</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Realized PnL</span>
                      <span className="text-emerald-400 font-bold">+{acc.pnlPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
