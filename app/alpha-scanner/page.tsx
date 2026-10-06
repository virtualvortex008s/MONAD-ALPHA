"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { TokenDossierDrawer } from "@/components/TokenDossierDrawer";
import { mockTokens } from "@/data/mockTokens";
import { Token } from "@/types/token";
import { MonadLogo } from "@/components/MonadLogo";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  ShieldAlert,
} from "lucide-react";

export default function AlphaScannerPage() {
  const { isConnected, connectWallet } = useWallet();

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("monad_watchlist");
      return saved ? JSON.parse(saved) : ["MONX", "ECHO"];
    }
    return ["MONX", "ECHO"];
  });

  // Interactive filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "HIGH_ALPHA" | "SAFE" | "WHALE">("ALL");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenToken = (token: Token) => {
    setSelectedToken(token);
    setIsDrawerOpen(true);
  };

  const handleToggleWatchlist = (tokenId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId];
      if (typeof window !== "undefined") {
        localStorage.setItem("monad_watchlist", JSON.stringify(next));
      }
      return next;
    });
  };

  // Filtered tokens for connected users
  const displayTokens = mockTokens.filter((token) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        token.name.toLowerCase().includes(q) ||
        token.symbol.toLowerCase().includes(q) ||
        token.address.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterMode === "HIGH_ALPHA") return token.alphaScore >= 85;
    if (filterMode === "SAFE") return token.riskScore <= 35;
    if (filterMode === "WHALE") return token.smartWalletsCount >= 10;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171922] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#00FFA3] uppercase">
              Monad Alpha Scanner · DEX Radar
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Real-Time Token Radar &amp; Smart Flow
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live parallel execution scanner tracking early meme breakouts, smart whale accumulations, and AI risk audits on Monad Testnet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#171922] bg-[#0D0F14] px-3.5 py-2 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Total Scanned:</span>
            <span className="text-white font-bold">{mockTokens.length} Tokens</span>
          </div>
          <div className="rounded-xl border border-[#00FFA3]/30 bg-[#00FFA3]/10 px-3.5 py-2 font-mono text-xs flex items-center gap-2">
            <span className="text-[#00FFA3] font-bold">10K TPS Parallel Engine</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, symbol, or 0x address..."
            disabled={!isConnected}
            className="w-full bg-[#0D0F14] border border-[#171922] rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7053F5] transition disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterMode === "ALL"
                ? "bg-[#7053F5] text-white shadow-md shadow-[#7053F5]/30 font-bold"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            All Pools
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("HIGH_ALPHA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterMode === "HIGH_ALPHA"
                ? "bg-[#7053F5] text-white shadow-md shadow-[#7053F5]/30 font-bold"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            Alpha ≥ 85
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("SAFE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterMode === "SAFE"
                ? "bg-[#00FFA3] text-black shadow-md shadow-[#00FFA3]/30 font-bold"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            Low Rug Risk
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("WHALE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterMode === "WHALE"
                ? "bg-[#7053F5] text-white shadow-md shadow-[#7053F5]/30 font-bold"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            Whale Inflow ≥ 10
          </button>
        </div>
      </div>

      {/* MAIN RADAR TABLE CONTAINER */}
      <div className="relative rounded-2xl border border-[#171922] bg-[#0D0F14] shadow-2xl overflow-hidden">
        {/* LOCK SCREEN OVERLAY FOR UNCONNECTED USERS */}
        {!isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#060709]/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl border border-[#7053F5]/30 bg-[#0D0F14] p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#7053F5]/20 border border-[#7053F5]/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(112,83,245,0.35)]">
                <Lock className="w-6 h-6 text-[#7053F5]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Connect MetaMask to Unlock Alpha Scanner
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time whale accumulation filters, volume anomaly alerts, and Gemini 2.0 Flash AI dossiers are unlocked upon connecting MetaMask to Monad Testnet.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#060709] border border-[#171922] text-left text-xs font-mono space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#00FFA3] shrink-0" />
                  <span>Unlimited Gemini 2.0 Flash AI Dossiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FFA3] shrink-0" />
                  <span>Automated Honeypot &amp; Rug Risk Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#7053F5] shrink-0" />
                  <span>Live DEX Liquidity Inflows (Monad Testnet)</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full py-3 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-bold text-xs shadow-lg shadow-[#7053F5]/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Connect MetaMask Wallet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCANNER TABLE PREVIEW (Blurred underneath when disconnected) */}
        <div className={`p-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 ${!isConnected ? "filter blur-sm select-none pointer-events-none" : ""}`}>
          <table className="w-full min-w-[650px] text-left text-xs font-mono">
            <thead className="border-b border-[#171922] text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Price / 1h</th>
                <th className="p-3">Alpha Score</th>
                <th className="p-3">Smart Money Flow</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171922]">
              {/* If connected, show full filtered tokens. If disconnected, render preview rows */}
              {(isConnected ? displayTokens : mockTokens.slice(0, 5)).map((token) => {
                const isPositive1h = token.change1h >= 0;
                const isSaved = watchlist.includes(token.id);

                return (
                  <tr
                    key={token.id}
                    onClick={() => isConnected && handleOpenToken(token)}
                    className="hover:bg-[#13161F]/60 transition-colors cursor-pointer group"
                  >
                    {/* Token Icon & Symbol */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatchlist(token.id);
                          }}
                          className={`p-1 rounded hover:bg-[#171922] transition ${
                            isSaved ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                          }`}
                          aria-label="Toggle watchlist"
                        >
                          ★
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-[#7053F5]/10 border border-[#7053F5]/30 flex items-center justify-center font-bold text-white text-xs">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#7053F5] transition">
                              ${token.symbol}
                            </span>
                            <span className="text-[10px] text-slate-500">{token.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price and 1h Change */}
                    <td className="p-3">
                      <span className="text-white font-bold block">${token.priceUsd.toFixed(4)}</span>
                      <span
                        className={`text-[10px] flex items-center gap-0.5 ${
                          isPositive1h ? "text-[#00FFA3]" : "text-rose-400"
                        }`}
                      >
                        {isPositive1h ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {token.change1h > 0 ? "+" : ""}
                        {token.change1h}%
                      </span>
                    </td>

                    {/* Alpha Score with Glow */}
                    <td className="p-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7053F5]/10 border border-[#7053F5]/30 text-[#7053F5] font-bold">
                        <Flame className="w-3.5 h-3.5 text-[#00FFA3]" />
                        <span>{token.alphaScore} / 100</span>
                      </div>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {token.alphaDriver}
                      </span>
                    </td>

                    {/* Smart Money Accumulators */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">{token.smartWalletsCount} Smart Wallets</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {(token.volume24h / 1000).toFixed(0)}k MON 24h Vol
                      </span>
                    </td>

                    {/* Honeypot & Rug Risk */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {token.riskScore <= 35 ? (
                          <span className="flex items-center gap-1 text-[#00FFA3] text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Low Risk ({token.riskScore})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Moderate ({token.riskScore})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        {token.riskFactors[0] || "Audit Passed"}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenToken(token);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#7053F5]/20 hover:bg-[#7053F5] text-white text-xs font-bold transition cursor-pointer"
                      >
                        Inspect Dossier →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Token Dossier Drawer */}
      <TokenDossierDrawer
        token={selectedToken}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isWatchlisted={selectedToken ? watchlist.includes(selectedToken.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
}
