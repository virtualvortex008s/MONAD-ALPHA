"use client";

import React, { useEffect, useState } from "react";
import { WalletTrade, Token } from "@/types/token";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from "lucide-react";

interface SmartMoneyFeedProps {
  initialTrades: WalletTrade[];
  tokens: Token[];
  onSelectTokenSymbol?: (symbol: string) => void;
}

export const SmartMoneyFeed: React.FC<SmartMoneyFeedProps> = ({
  initialTrades,
  tokens,
  onSelectTokenSymbol,
}) => {
  const [trades, setTrades] = useState<WalletTrade[]>(initialTrades);
  const [filterTag, setFilterTag] = useState<string>("ALL");

  // Real-time trade generator to simulate live 10,000 TPS Monad testnet transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      const tags: ("Sniper" | "Smart Trader" | "Whale")[] = ["Sniper", "Smart Trader", "Whale"];
      const chosenTag = tags[Math.floor(Math.random() * tags.length)];
      const isBuy = Math.random() > 0.3; // 70% buys in bull momentum
      const amountMon = Math.floor(1500 + Math.random() * 25000);
      const amountUsd = Math.floor(amountMon * 4.2);
      const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16);
      const randomTx = Math.floor(100000 + Math.random() * 900000).toString(16);

      const newTrade: WalletTrade = {
        id: `tx-live-${Date.now()}`,
        walletAddress: `0x${randomHex}...${Math.floor(1000 + Math.random() * 9000)}`,
        walletTag: chosenTag,
        winRate: Math.floor(75 + Math.random() * 23),
        tokenSymbol: randomToken.symbol,
        tokenName: randomToken.name,
        type: isBuy ? "BUY" : "SELL",
        amountMon,
        amountUsd,
        timestamp: "Just now",
        txHash: `0x${randomTx}...${randomHex}`,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [tokens]);

  const filteredTrades = filterTag === "ALL"
    ? trades
    : trades.filter((t) => t.walletTag === filterTag);

  return (
    <div className="rounded-xl border border-[#1E2230] bg-[#12141C] p-4 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2230] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7053F5]/20 text-[#7053F5]">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Smart Money Live Flow
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAM
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Tracking top 1% smart wallets, DEX snipers, and high-net-worth Monad whales
            </p>
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#0E1017] p-1 text-xs">
          {["ALL", "Whale", "Sniper", "Smart Trader"].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                filterTag === tag
                  ? "bg-[#7053F5] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tag === "ALL" ? "All Trades" : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Ticker Feed */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {filteredTrades.map((trade) => {
          const isBuy = trade.type === "BUY";
          return (
            <div
              key={trade.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 transition-all hover:border-[#7053F5]/40 hover:bg-[#151722]"
            >
              {/* Left: Wallet Info */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isBuy
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "bg-red-500/15 text-red-400 border border-red-500/25"
                  }`}
                >
                  {isBuy ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      {trade.walletAddress}
                    </span>
                    <span className="rounded bg-[#7053F5]/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/25">
                      {trade.walletTag}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                      {trade.winRate}% WR
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                    <span>Tx: {trade.txHash}</span>
                    <span>•</span>
                    <span>{trade.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Right: Asset & Amount */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <button
                    onClick={() =>
                      onSelectTokenSymbol && onSelectTokenSymbol(trade.tokenSymbol)
                    }
                    className="group flex items-center justify-end gap-1.5"
                  >
                    <span className="font-bold text-white text-xs group-hover:text-[#7053F5] transition-colors">
                      {trade.tokenSymbol}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-extrabold ${
                        isBuy
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {trade.type}
                    </span>
                  </button>
                  <div className="font-mono text-xs font-bold text-slate-200 mt-0.5">
                    ${trade.amountUsd.toLocaleString()}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                      ({trade.amountMon.toLocaleString()} MON)
                    </span>
                  </div>
                </div>

                <a
                  href={`https://testnet.monadexplorer.com/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded p-1.5 text-slate-500 hover:text-white hover:bg-[#1E2230] transition-colors"
                  title="View on Monad Explorer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
