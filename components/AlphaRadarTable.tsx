"use client";

import React, { useState } from "react";
import { Token } from "@/types/token";
import {
  Copy,
  Check,
  Star,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  ArrowUpDown,
} from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";

interface AlphaRadarTableProps {
  tokens: Token[];
  selectedTokenId: string | null;
  onSelectToken: (token: Token) => void;
  watchlist: string[];
  onToggleWatchlist: (tokenId: string) => void;
}

type SortField = "alphaScore" | "priceUsd" | "change1h" | "riskScore" | "smartMoneyNetFlow" | "volume24h";

export const AlphaRadarTable: React.FC<AlphaRadarTableProps> = ({
  tokens,
  selectedTokenId,
  onSelectToken,
  watchlist,
  onToggleWatchlist,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("alphaScore");
  const [sortAsc, setSortAsc] = useState(false);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1800);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let diff = 0;
    if (sortField === "alphaScore") diff = b.alphaScore - a.alphaScore;
    if (sortField === "priceUsd") diff = b.priceUsd - a.priceUsd;
    if (sortField === "change1h") diff = b.change1h - a.change1h;
    if (sortField === "riskScore") diff = a.riskScore - b.riskScore; // lower risk first when default
    if (sortField === "smartMoneyNetFlow") diff = b.smartMoneyNetFlow - a.smartMoneyNetFlow;
    if (sortField === "volume24h") diff = b.volume24h - a.volume24h;

    return sortAsc ? -diff : diff;
  });

  const getRiskBadge = (score: number) => {
    if (score <= 25) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span>{score} / 100</span>
        </span>
      );
    }
    if (score <= 60) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
          <Shield className="h-3 w-3 text-amber-400" />
          <span>{score} / 100</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400">
        <Shield className="h-3 w-3 text-red-400" />
        <span>{score} / 100</span>
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#171922] bg-[#0D0F14] shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="border-b border-[#171922] bg-[#0A0C11] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-10 text-center">★</th>
              <th className="py-3.5 px-3">Asset</th>
              <th
                onClick={() => handleSort("priceUsd")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Price / 1h %</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("alphaScore")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Alpha Score</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("riskScore")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("smartMoneyNetFlow")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Smart Flow (1h)</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("volume24h")}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Liquidity / 24h Vol</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#1E2230]">
            {sortedTokens.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="text-sm">No tokens match current filter criteria.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try switching filters or clearing the watchlist filter.
                  </p>
                </td>
              </tr>
            ) : (
              sortedTokens.map((token) => {
                const isSelected = selectedTokenId === token.id;
                const isWatchlisted = watchlist.includes(token.id);
                const isPositive1h = token.change1h >= 0;
                const isCopied = copiedAddress === token.address;

                return (
                  <tr
                    key={token.id}
                    onClick={() => onSelectToken(token)}
                    className={`cursor-pointer transition-colors group border-b border-[#171922]/60 ${
                      isSelected
                        ? "bg-[#7053F5]/10 border-l-2 border-[#7053F5]"
                        : "hover:bg-[#13161F]"
                    }`}
                  >
                    {/* Watchlist Toggle */}
                    <td className="py-3.5 pl-4 pr-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(token.id);
                        }}
                        className="rounded p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isWatchlisted ? "fill-amber-400 text-amber-400" : "text-slate-500"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Asset Name + Address */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7053F5]/15 font-mono text-xs font-black text-[#7053F5] border border-[#7053F5]/25">
                          {token.symbol.replace("$", "").slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm group-hover:text-[#7053F5] transition-colors">
                              {token.symbol}
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                              {token.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-500">
                              {token.address.slice(0, 6)}...{token.address.slice(-4)}
                            </span>
                            <button
                              onClick={(e) => handleCopy(token.address, e)}
                              className="rounded p-0.5 text-slate-500 hover:text-white transition-colors"
                              title="Copy contract address"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-[#00FFA3]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            {isCopied && (
                              <span className="text-[9px] text-[#00FFA3] font-semibold">
                                Copied
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price & 1h Change */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-sm font-semibold text-white">
                        ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] mt-0.5">
                        <span
                          className={`flex items-center font-bold ${
                            isPositive1h ? "text-[#00FFA3]" : "text-red-400"
                          }`}
                        >
                          {isPositive1h ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {isPositive1h ? "+" : ""}
                          {token.change1h.toFixed(1)}%
                        </span>
                        <span className="text-slate-500">1h</span>
                      </div>
                    </td>

                    {/* Alpha Score with Circular ScoreGauge */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <ScoreGauge score={token.alphaScore} size={36} strokeWidth={3} />
                        <span className="rounded bg-[#13161F] px-1.5 py-0.5 text-[10px] font-medium text-slate-300 border border-[#171922]">
                          {token.alphaDriver}
                        </span>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-3">
                      {getRiskBadge(token.riskScore)}
                      <div className="mt-1 text-[10px] text-slate-500 font-mono">
                        {token.lpStatus.split(" ")[0]}
                      </div>
                    </td>

                    {/* Smart Flow Volume */}
                    <td className="py-3.5 px-3">
                      <div
                        className={`font-mono font-bold text-xs ${
                          token.smartMoneyNetFlow >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {token.smartMoneyNetFlow >= 0 ? "+" : ""}$
                        {Math.abs(token.smartMoneyNetFlow) >= 1000
                          ? `${(token.smartMoneyNetFlow / 1000).toFixed(0)}k`
                          : token.smartMoneyNetFlow}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Activity className="h-3 w-3 text-slate-500" />
                        <span>{token.smartWalletsCount} smart wallets</span>
                      </div>
                    </td>

                    {/* Liquidity / 24h Vol */}
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="font-mono text-xs text-white">
                        ${(token.liquidity / 1000).toFixed(0)}k Liq
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        ${(token.volume24h / 1_000_000).toFixed(1)}M Vol
                      </div>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 pr-4 pl-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectToken(token);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#191C27] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-[#7053F5] hover:bg-[#7053F5]/15 hover:text-white transition-all group-hover:border-[#7053F5]/40"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
