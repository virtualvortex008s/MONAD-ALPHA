"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockTokens, mockTrades } from "@/data/mockTokens";
import { SmartMoneyFeed } from "@/components/SmartMoneyFeed";
import { LiveBlockStream } from "@/components/LiveBlockStream";
import { MonadLogo } from "@/components/MonadLogo";
import {
  Users,
  ChevronRight,
  ArrowUpRight,
  Boxes,
  Activity,
} from "lucide-react";

export default function SmartMoneyPage() {
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeFeedTab, setActiveFeedTab] = useState<"SMART_MONEY" | "BLOCKS">("SMART_MONEY");

  // Aggregate all accumulators from mock data into a unified leaderboard
  const allWallets = mockTokens.flatMap((t) =>
    t.smartAccumulators.map((acc) => ({
      ...acc,
      favoriteToken: t.symbol,
      tokenAddress: t.address,
      tokenName: t.name,
    }))
  );

  const filteredWallets = selectedTag === "ALL"
    ? allWallets
    : allWallets.filter((w) => w.tag === selectedTag);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2230] bg-gradient-to-r from-[#12141C] via-[#161329] to-[#12141C] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MonadLogo size={18} className="rounded-full shadow-[0_0_10px_rgba(112, 83, 245,0.5)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#7053F5]">
                Monad Smart Money Intelligence
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-emerald-400">1,482 Wallets Tracked</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smart Money <span className="text-[#7053F5]">Tracker & Leaderboard</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Reverse-engineer the most profitable Monad testnet addresses. Monitor live DEX frontrunning,
              sniper clusters, and high-conviction whale re-accumulations in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="rounded-xl border border-[#1E2230] bg-[#0B0C10]/60 px-4 py-2.5">
              <span className="text-slate-500 block text-[10px]">24h Net Inflow</span>
              <span className="font-bold text-emerald-400">+$3.84M USD</span>
            </div>
            <div className="rounded-xl border border-[#1E2230] bg-[#0B0C10]/60 px-4 py-2.5">
              <span className="text-slate-500 block text-[10px]">Avg Win Rate</span>
              <span className="font-bold text-white">87.2%</span>
            </div>
          </div>
        </div>

        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#7053F5]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 1. Tracked Wallets Leaderboard */}
      <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-6 shadow-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2230] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7053F5]/20 text-[#7053F5]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Top 1% Smart Wallets Leaderboard</h2>
              <p className="text-xs text-slate-400">Ranked by historical DEX swap win rate and cumulative realized PnL</p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#0E1017] p-1 text-xs">
            {["ALL", "Whale", "Sniper", "Smart Trader"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  selectedTag === tag
                    ? "bg-[#7053F5] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag === "ALL" ? "All Tags" : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#1E2230] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="pb-3 pl-2">Rank / Wallet Address</th>
                <th className="pb-3 px-3">Classification</th>
                <th className="pb-3 px-3">Win Rate</th>
                <th className="pb-3 px-3">Total Volume</th>
                <th className="pb-3 px-3">Realized PnL</th>
                <th className="pb-3 px-3">Primary Asset</th>
                <th className="pb-3 pr-2 text-right">Inspect Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2230]">
              {filteredWallets.map((wallet, index) => {
                // Map to full 42 char address for linking
                const cleanHash = wallet.walletAddress.replace("...", "").replace("0x", "");
                const fullAddress = `0x${cleanHash}00000000000000000000000000000000`.slice(0, 42);

                return (
                  <tr key={index} className="hover:bg-[#191C27] transition-colors group">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-500 w-5">
                          #{index + 1}
                        </span>
                        <Link
                          href={`/wallet/${fullAddress}`}
                          className="font-mono text-xs font-bold text-white group-hover:text-[#7053F5] transition-colors flex items-center gap-1.5"
                        >
                          <span>{wallet.walletAddress}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-500 block pl-8">
                        Active {wallet.lastActive}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block rounded bg-[#7053F5]/15 px-2 py-0.5 text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/25">
                        {wallet.tag}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {wallet.winRate}% WR
                      </span>
                      <div className="h-1 w-16 rounded-full bg-[#1E2230] mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${wallet.winRate}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className="text-white font-semibold block text-xs">
                        ${wallet.accumulatedUsd.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MonadLogo size={11} /> {wallet.accumulatedMon.toLocaleString()} MON
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={`text-xs font-bold ${
                          wallet.pnlPercent >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {wallet.pnlPercent >= 0 ? "+" : ""}{wallet.pnlPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Avg Entry: ${wallet.avgEntryUsd}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <Link
                        href={`/token/${wallet.tokenAddress}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E1017] px-2 py-1 text-xs font-semibold text-slate-200 border border-[#1E2230] hover:border-[#7053F5] transition-colors"
                      >
                        <span className="font-bold text-[#7053F5]">{wallet.favoriteToken}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                          {wallet.tokenName}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <Link
                        href={`/wallet/${fullAddress}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#191C27] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-[#7053F5] hover:text-white transition-colors"
                      >
                        <span>Profile</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Live On-Chain Stream (Smart Money Flow & Monad Blocks) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#1E2230] bg-[#12141C] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveFeedTab("SMART_MONEY")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                activeFeedTab === "SMART_MONEY"
                  ? "bg-[#7053F5] text-white shadow-[0_0_12px_rgba(112, 83, 245,0.35)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Smart Money Live Flow</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </button>

            <button
              type="button"
              onClick={() => setActiveFeedTab("BLOCKS")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                activeFeedTab === "BLOCKS"
                  ? "bg-[#7053F5] text-white shadow-[0_0_12px_rgba(112, 83, 245,0.35)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Live Monad Block Stream</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Direct RPC:</span>
            <span className="text-slate-300">testnet-rpc.monad.xyz</span>
            <span>•</span>
            <span className="text-[#7053F5]">10143</span>
          </div>
        </div>

        {activeFeedTab === "SMART_MONEY" ? (
          <SmartMoneyFeed
            initialTrades={mockTrades}
            tokens={mockTokens}
            onSelectTokenSymbol={() => {}}
          />
        ) : (
          <LiveBlockStream />
        )}
      </div>
    </div>
  );
}
