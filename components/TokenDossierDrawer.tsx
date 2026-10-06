"use client";

import React, { useState, useEffect } from "react";
import { Token } from "@/types/token";
import { TokenIntelligenceReport } from "@/lib/gemini";
import { MiniChart } from "./MiniChart";
import { MonadLogo } from "./MonadLogo";
import { useWallet } from "@/context/WalletContext";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Zap,
  Lock,
  RefreshCw,
  AlertTriangle,
  Bot,
  ArrowRight,
} from "lucide-react";
import { executeMonToTokenSwap } from "@/lib/swap";

interface TokenDossierDrawerProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (tokenId: string) => void;
}

export const TokenDossierDrawer: React.FC<TokenDossierDrawerProps> = ({
  token,
  isOpen,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const { isConnected, connectWallet } = useWallet();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatusText, setSwapStatusText] = useState("");
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<{ symbol: string; report: TokenIntelligenceReport } | null>(null);

  const aiReport = token && aiData?.symbol === token.symbol ? aiData.report : null;
  const isAiGenerating = !aiReport;

  useEffect(() => {
    // Only call Gemini Flash API if drawer is open, token is present, and wallet is connected
    if (!isOpen || !token || !isConnected) return;

    let ignore = false;
    const currentSymbol = token.symbol;

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
          setAiData({ symbol: currentSymbol, report: data });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch live AI intelligence:", err);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, token, isConnected]);

  if (!isOpen || !token) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(token.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleExecuteSwap = async () => {
    if (!token) return;
    setIsSwapping(true);
    setSwapError(null);
    setSwapTxHash(null);
    setSwapStatusText("Verifying Monad Testnet...");

    const res = await executeMonToTokenSwap({
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      amountMon: 0.05,
      onStatusUpdate: (status) => setSwapStatusText(status),
    });

    setIsSwapping(false);
    if (res.success && res.txHash) {
      setSwapTxHash(res.txHash);
    } else {
      setSwapError(res.error || "Swap failed on Monad Testnet.");
    }
  };

  const isPositive1h = token.change1h >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl transform border-l border-[#171922] bg-[#060709] shadow-2xl transition-all flex flex-col">
          {/* Drawer Header */}
          <div className="border-b border-[#171922] bg-[#0D0F14] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7053F5] to-[#5035E4] font-mono text-base font-black text-white shadow-[0_0_15px_rgba(112, 83, 245,0.4)]">
                  {token.symbol.replace("$", "").slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {token.symbol}
                    </h2>
                    <span className="text-sm text-slate-400 font-medium">
                      {token.name}
                    </span>
                    <span className="rounded bg-[#7053F5]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/30">
                      Alpha {token.alphaScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 font-mono text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <span>
                        {token.address.slice(0, 8)}...{token.address.slice(-6)}
                      </span>
                      {copiedAddress ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <span className="text-slate-600">•</span>
                    <a
                      href={`https://explorer.monad.xyz/token/${token.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#7053F5] transition-colors"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="rounded-xl border border-[#1E2230] bg-[#191C27] p-2 text-slate-400 hover:bg-[#1E2230] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price & Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E2230] pt-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-white">
                    ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                  </span>
                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                    ≈ <MonadLogo size={13} className="inline-block" /> {token.priceMon} MON
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs mt-1">
                  <span
                    className={`flex items-center font-bold ${
                      isPositive1h ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isPositive1h ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {isPositive1h ? "+" : ""}
                    {token.change1h}% (1h)
                  </span>
                  <span className="text-slate-500">•</span>
                  <span
                    className={`font-semibold ${
                      token.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h}% (24h)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleWatchlist(token.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    isWatchlisted
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border-[#1E2230] bg-[#191C27] text-slate-300 hover:text-white hover:border-slate-500"
                  }`}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      isWatchlisted ? "fill-amber-400 text-amber-400" : "text-slate-400"
                    }`}
                  />
                  <span>{isWatchlisted ? "Saved" : "Watchlist"}</span>
                </button>

                <button
                  onClick={handleExecuteSwap}
                  disabled={isSwapping}
                  className="flex items-center gap-1.5 rounded-xl bg-[#7053F5] px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(112, 83, 245,0.4)] hover:bg-[#6C52EE] transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Swapping...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      <span>Swap 0.05 MON</span>
                    </>
                  )}
                </button>

                <a
                  href={`/token/${token.address}`}
                  className="flex items-center gap-1 rounded-xl border border-[#7053F5]/50 bg-[#7053F5]/10 px-3 py-2 text-xs font-bold text-[#7053F5] hover:bg-[#7053F5]/20 transition-all"
                >
                  <span>Full Page</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Live Swap Feedback Banner */}
            {isSwapping && (
              <div className="mt-3 rounded-lg border border-[#7053F5]/40 bg-[#7053F5]/10 p-2.5 text-xs text-[#7053F5] flex items-center gap-2 animate-pulse font-mono">
                <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                <span>{swapStatusText}</span>
              </div>
            )}

            {swapTxHash && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in duration-200">
                <span className="flex items-center gap-2 truncate">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Confirmed on Monad Testnet!</span>
                </span>
                <a
                  href={`https://testnet.monadexplorer.com/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-white hover:text-emerald-300 flex items-center gap-1 underline ml-2 shrink-0"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {swapError && (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-center justify-between animate-in fade-in duration-200">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="truncate">{swapError}</span>
                </span>
                <button
                  onClick={() => setSwapError(null)}
                  className="text-slate-400 hover:text-white text-xs ml-2 shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. Interactive Chart */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Price Action
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Execution: 1s Block Intervals
                </span>
              </div>
              <MiniChart
                candles5m={token.candles5m}
                candles15m={token.candles15m}
                candles1h={token.candles1h}
                symbol={token.symbol}
                priceUsd={token.priceUsd}
              />
            </div>

            {/* 2. Gemini Flash AI Intelligence Dossier Box */}
            <div className="rounded-xl border border-[#7053F5]/40 bg-gradient-to-br from-[#12141C] to-[#18162A] p-4 shadow-[0_0_20px_rgba(112, 83, 245,0.12)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7053F5]/20 text-[#7053F5]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Gemini Flash AI Intelligence
                      <span className="rounded bg-[#7053F5]/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#7053F5] border border-[#7053F5]/40">
                        gemini-2.0-flash
                      </span>
                    </h3>
                  </div>
                </div>
                {!isConnected ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                    LOCKED 🔒
                  </span>
                ) : (
                  aiReport?.tokenPhase && (
                    <span className="rounded bg-[#7053F5]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#7053F5] border border-[#7053F5]/40">
                      Phase: {aiReport.tokenPhase}
                    </span>
                  )
                )}
              </div>

              {isConnected ? (
                <>
                  {isAiGenerating && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#7053F5]/40 bg-[#7053F5]/15 px-3 py-2 text-xs font-mono text-[#7053F5] animate-pulse">
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-[#7053F5]" />
                      <span className="font-semibold">Generating Gemini 2.0 Flash Intelligence...</span>
                    </div>
                  )}

                  {/* 1-sentence Plain English Momentum Driver */}
                  <div className="rounded-lg border border-[#1E2230] bg-[#0E1017] p-3 text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-[#7053F5]">Primary Catalyst: </span>
                    {aiReport?.aiSummary || token.aiSummary}
                  </div>

                  {/* Buyer / Seller Organic Verdict if available */}
                  {aiReport?.buyerSellerVerdict && (
                    <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 font-mono flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{aiReport.buyerSellerVerdict}</span>
                    </div>
                  )}

                  {/* Key Catalysts Bullets */}
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2">
                      Verified On-Chain Signals:
                    </h4>
                    <div className="space-y-1.5">
                      {(aiReport?.keyCatalysts || token.catalysts).map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7053F5]" />
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security & Risk Breakdown */}
                  <div className="mt-4 border-t border-[#1E2230] pt-3">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Contract Security & Distribution</span>
                      <span className="font-mono text-xs">
                        Risk Score:{" "}
                        <span
                          className={`font-bold ${
                            token.riskScore <= 25
                              ? "text-emerald-400"
                              : token.riskScore <= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {token.riskScore}/100
                        </span>
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-[#1E2230] bg-[#0E1017] p-2.5">
                        <span className="text-slate-500 text-[11px] block">
                          Top 10 Concentration
                        </span>
                        <span
                          className={`font-mono text-sm font-bold ${
                            token.holderConcentrationTop10 < 30
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {token.holderConcentrationTop10}%
                        </span>
                      </div>

                      <div className="rounded-lg border border-[#1E2230] bg-[#0E1017] p-2.5">
                        <span className="text-slate-500 text-[11px] block">
                          Liquidity Status
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                          <Lock className="h-3 w-3 text-emerald-400" />
                          {token.lpStatus}
                        </span>
                      </div>

                      <div className="rounded-lg border border-[#1E2230] bg-[#0E1017] p-2.5">
                        <span className="text-slate-500 text-[11px] block">
                          Deployer Balance
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                          <MonadLogo size={13} className="inline-block" />
                          {token.deployerBalanceMon} MON
                        </span>
                      </div>

                      <div className="rounded-lg border border-[#1E2230] bg-[#0E1017] p-2.5">
                        <span className="text-slate-500 text-[11px] block">
                          Deployer Address
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 truncate block">
                          {token.deployerAddress.slice(0, 8)}...
                          {token.deployerAddress.slice(-6)}
                        </span>
                      </div>
                    </div>

                    {token.riskFactors.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {token.riskFactors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-[#191C27] px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-[#1E2230]"
                          >
                            <ShieldCheck className="h-3 w-3 text-slate-400" />
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* UNLOCK PROMPT FOR UNCONNECTED USERS */
                <div className="p-4 rounded-xl bg-[#0D0F14] border border-[#171922] text-center space-y-3 font-sans">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gemini AI catalyst breakdown, organic buyer/seller ratios, and rug safety audits are unlocked when connected to Monad Testnet.
                  </p>
                  <button
                    onClick={connectWallet}
                    className="px-4 py-2.5 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white text-xs font-bold shadow-md shadow-[#7053F5]/25 transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Connect MetaMask to Unlock AI Dossier</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Top Smart Accumulators Table */}
            <div className="rounded-xl border border-[#1E2230] bg-[#12141C] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[#7053F5]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Top Smart Accumulators
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {token.smartAccumulators.length} Tier-1 Wallets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#1E2230] text-[10px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="pb-2">Wallet</th>
                      <th className="pb-2">Tag / Win Rate</th>
                      <th className="pb-2">Accumulated</th>
                      <th className="pb-2 text-right">Avg Entry / PnL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2230]">
                    {token.smartAccumulators.map((acc, idx) => (
                      <tr key={idx} className="hover:bg-[#191C27] transition-colors">
                        <td className="py-2.5">
                          <span className="font-mono text-xs font-semibold text-slate-200">
                            {acc.walletAddress}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {acc.lastActive}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="inline-block rounded bg-[#7053F5]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#7053F5] border border-[#7053F5]/20">
                            {acc.tag}
                          </span>
                          <span className="ml-1.5 font-mono text-[10px] text-emerald-400">
                            {acc.winRate}% WR
                          </span>
                        </td>
                        <td className="py-2.5 font-mono">
                          <span className="text-white font-semibold block">
                            ${acc.accumulatedUsd.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MonadLogo size={11} className="inline-block" />
                            {acc.accumulatedMon.toLocaleString()} MON
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          <span className="text-slate-300 block">
                            ${acc.avgEntryUsd}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              acc.pnlPercent >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {acc.pnlPercent >= 0 ? "+" : ""}
                            {acc.pnlPercent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
