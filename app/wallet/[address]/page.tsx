"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { mockTokens, mockTrades } from "@/data/mockTokens";
import {
  Wallet,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface WalletPageProps {
  params: Promise<{ address: string }>;
}

export default function WalletProfilerPage({ params }: WalletPageProps) {
  const resolvedParams = use(params);
  const rawAddress = decodeURIComponent(resolvedParams.address);

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Find accumulator across mockTokens that matches or has address substring
  const allAccumulators = mockTokens.flatMap((t) =>
    t.smartAccumulators.map((acc) => ({
      ...acc,
      tokenSymbol: t.symbol,
      tokenName: t.name,
      tokenAddress: t.address,
      tokenPriceUsd: t.priceUsd,
    }))
  );

  const matchedAccumulators = allAccumulators.filter(
    (acc) =>
      acc.walletAddress.toLowerCase().includes(rawAddress.toLowerCase()) ||
      rawAddress.toLowerCase().includes(acc.walletAddress.toLowerCase())
  );

  // Fallback defaults if not explicitly in accumulator list
  const primaryProfile = matchedAccumulators[0] || {
    walletAddress: rawAddress,
    tag: (rawAddress.length % 2 === 0 ? "Whale" : "Smart Trader") as "Whale" | "Smart Trader" | "Sniper",
    winRate: 88,
    accumulatedMon: 48200,
    accumulatedUsd: 202440,
    avgEntryUsd: 0.021,
    pnlPercent: 104.8,
    lastActive: "1m ago",
    tokenSymbol: "$CHOG",
    tokenName: "Chog on Monad",
    tokenAddress: mockTokens[0].address,
    tokenPriceUsd: mockTokens[0].priceUsd,
  };

  // Find trades associated with this wallet
  const walletTrades = mockTrades.filter(
    (tr) =>
      tr.walletAddress.toLowerCase().includes(rawAddress.toLowerCase()) ||
      rawAddress.toLowerCase().includes(tr.walletAddress.toLowerCase())
  );

  const displayTrades = walletTrades.length > 0 ? walletTrades : mockTrades.slice(0, 5);

  const handleCopy = () => {
    navigator.clipboard.writeText(primaryProfile.walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const tagColors = {
    Whale: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Sniper: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    "Smart Trader": "border-[#7053F5]/30 bg-[#7053F5]/10 text-[#7053F5]",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/smart-money"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Smart Money Tracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
              isBookmarked
                ? "border-[#7053F5] bg-[#7053F5]/20 text-white"
                : "border-[#1E2230] bg-[#12141C] text-slate-400 hover:text-white"
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-[#7053F5]" />
                <span>Tracking Wallet</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                <span>Track Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2230] bg-[#12141C] p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Identity */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E2230] to-[#12141C] border border-[#7053F5]/30 text-[#7053F5] shadow-[0_0_20px_rgba(112, 83, 245,0.2)]">
              <Wallet className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black text-white font-mono truncate max-w-[180px] sm:max-w-none">
                  {primaryProfile.walletAddress}
                </h1>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
                    tagColors[primaryProfile.tag] || tagColors["Smart Trader"]
                  }`}
                >
                  {primaryProfile.tag}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Active {primaryProfile.lastActive}
                </span>
              </div>

              {/* Links */}
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md bg-[#191C27] px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Copy Address</span>
                  {copiedAddress ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <a
                  href={`https://testnet.monadexplorer.com/address/${primaryProfile.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-[#7053F5] transition-colors"
                >
                  <span>MonadScan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-500 hidden sm:inline">Tier-1 Smart Cluster #492</span>
              </div>
            </div>
          </div>

          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 font-mono text-xs w-full lg:w-auto">
            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 text-center min-w-0">
              <span className="text-slate-500 block text-[10px] uppercase">Win Rate</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{primaryProfile.winRate}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Historical DEX</span>
            </div>

            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 text-center min-w-0">
              <span className="text-slate-500 block text-[10px] uppercase">Realized PnL</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">+{primaryProfile.pnlPercent}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">+${(primaryProfile.accumulatedUsd * 0.45).toFixed(0)}</span>
            </div>

            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 text-center min-w-0">
              <span className="text-slate-500 block text-[10px] uppercase">Accumulated</span>
              <span className="text-lg sm:text-xl font-black text-white truncate">{primaryProfile.accumulatedMon.toLocaleString()}</span>
              <span className="text-[10px] text-[#7053F5] block mt-0.5">MON</span>
            </div>

            <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 text-center min-w-0">
              <span className="text-slate-500 block text-[10px] uppercase">Execution</span>
              <span className="text-lg sm:text-xl font-black text-white">&lt;0.8s</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Block 0-1 Entry</span>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 h-52 w-52 rounded-full bg-[#7053F5]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Portfolio Holdings & Intelligence */}
        <div className="lg:col-span-2 space-y-8">
          {/* Portfolio Holdings */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#7053F5]" />
                <h2 className="text-base font-bold text-white">Active Monad Token Holdings</h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {matchedAccumulators.length > 0 ? matchedAccumulators.length : 1} Positions
              </span>
            </div>

            <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[550px] text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1E2230] bg-[#0E1017]/60 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4 text-right">Accumulated</th>
                    <th className="py-3 px-4 text-right">Avg Entry</th>
                    <th className="py-3 px-4 text-right">Current PnL</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2230]/60">
                  {(matchedAccumulators.length > 0 ? matchedAccumulators : [primaryProfile]).map((pos, idx) => (
                    <tr key={idx} className="hover:bg-[#161924]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7053F5]/20 font-bold text-[#7053F5]">
                            {pos.tokenSymbol.replace("$", "").slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-sans font-bold text-white block">
                              {pos.tokenSymbol}
                            </span>
                            <span className="text-[10px] text-slate-500 font-sans">
                              {pos.tokenName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="text-white font-bold">
                          {pos.accumulatedMon.toLocaleString()} MON
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ${pos.accumulatedUsd.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="text-slate-300">
                          ${pos.avgEntryUsd.toFixed(4)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className={`font-bold ${
                            pos.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/token/${pos.tokenAddress}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#7053F5]/40 bg-[#7053F5]/10 px-2.5 py-1 text-xs font-bold text-[#7053F5] hover:bg-[#7053F5] hover:text-white transition-all"
                        >
                          <span>Trade</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallet Intelligence / Behavioral Profile */}
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2230] pb-4">
              <Sparkles className="h-5 w-5 text-[#7053F5]" />
              <h3 className="text-base font-bold text-white">Algorithmic Behavior Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3.5 sm:p-4 space-y-2">
                <span className="font-bold text-white block">Execution Characteristics</span>
                <p className="text-slate-400 leading-relaxed">
                  Consistently utilizes customized private RPCs targeting sub-second block slots. 
                  94% of entries are executed within 1 second of liquidity establishment on Monad DEX.
                </p>
              </div>

              <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3.5 sm:p-4 space-y-2">
                <span className="font-bold text-white block">Risk Management Rules</span>
                <p className="text-slate-400 leading-relaxed">
                  Enforces strict stop-loss cutoffs at -15% drawdown with systematic scale-outs at 2x and 3x multipliers. 
                  Zero exposure to unverified bytecode contracts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Transaction History */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2230] pb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#7053F5]" />
                <h3 className="font-bold text-white text-sm">Recent Monad Transactions</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Confirmed &lt;1s</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {displayTrades.map((trade) => {
                const isBuy = trade.type === "BUY";
                return (
                  <div
                    key={trade.id}
                    className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 space-y-2 hover:border-[#7053F5]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isBuy
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {trade.type}
                      </span>
                      <span className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {trade.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {trade.tokenSymbol}
                      </span>
                      <div className="text-right">
                        <span className="text-white font-bold block">
                          {trade.amountMon.toLocaleString()} MON
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          ${trade.amountUsd.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1E2230] pt-2 text-[10px] text-slate-500">
                      <span>Tx: {trade.txHash}</span>
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${trade.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#7053F5] transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
