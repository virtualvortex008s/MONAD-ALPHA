"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Dices,
  TrendingUp,
  Flame,
  ShieldCheck,
  Wallet,
  Sparkles,
  ExternalLink,
  Coins,
  ArrowRight,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { MetaMaskLogo } from "@/components/icons/MetaMaskLogo";
import { EvenOddDice } from "@/components/games/EvenOddDice";
import { PricePrediction } from "@/components/games/PricePrediction";

export default function GamesPage() {
  const { address, balance, isConnected, connectWallet } = useWallet();

  // Active game tab ("dice" | "price")
  const [activeTab, setActiveTab] = useState<"dice" | "price">("dice");

  // Global Arcade Stats
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [netProfitMon, setNetProfitMon] = useState<number>(0);
  const [sessionCredits, setSessionCredits] = useState<number>(0);
  const [hasClaimedFaucet, setHasClaimedFaucet] = useState<boolean>(false);

  // Initialize stats from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("monad_arcade_stats");
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setCurrentStreak(parsed.currentStreak || 0);
        setBestStreak(parsed.bestStreak || 0);
        setTotalGamesPlayed(parsed.totalGamesPlayed || 0);
        setTotalWins(parsed.totalWins || 0);
        setNetProfitMon(parsed.netProfitMon || 0);
      }

      const savedCredits = localStorage.getItem("monad_arcade_credits");
      if (savedCredits) {
        setSessionCredits(parseFloat(savedCredits) || 0);
      }
    } catch (e) {
      console.warn("Could not load arcade stats", e);
    }
  }, []);

  // Update streak handler
  const handleStreakUpdate = (newStreak: number) => {
    setCurrentStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));
    setTotalGamesPlayed((prev) => prev + 1);
    if (newStreak > currentStreak) {
      setTotalWins((prev) => prev + 1);
    }

    try {
      const stats = {
        currentStreak: newStreak,
        bestStreak: Math.max(bestStreak, newStreak),
        totalGamesPlayed: totalGamesPlayed + 1,
        totalWins: newStreak > currentStreak ? totalWins + 1 : totalWins,
        netProfitMon,
      };
      localStorage.setItem("monad_arcade_stats", JSON.stringify(stats));
    } catch {}
  };

  // Adjust balance from winnings / losses
  const handleBalanceAdjust = (profitAmount: number) => {
    setNetProfitMon((prev) => {
      const updated = Number((prev + profitAmount).toFixed(3));
      try {
        const stats = {
          currentStreak,
          bestStreak,
          totalGamesPlayed,
          totalWins,
          netProfitMon: updated,
        };
        localStorage.setItem("monad_arcade_stats", JSON.stringify(stats));
      } catch {}
      return updated;
    });

    setSessionCredits((prev) => {
      const next = Math.max(0, Number((prev + profitAmount).toFixed(3)));
      try {
        localStorage.setItem("monad_arcade_credits", next.toString());
      } catch {}
      return next;
    });
  };

  // Claim 5.0 Arcade MON Faucet
  const handleClaimFaucet = () => {
    const added = 5.0;
    setSessionCredits((prev) => {
      const next = Number((prev + added).toFixed(3));
      try {
        localStorage.setItem("monad_arcade_credits", next.toString());
      } catch {}
      return next;
    });
    setHasClaimedFaucet(true);
    setTimeout(() => setHasClaimedFaucet(false), 3000);
  };

  // Compute effective balance: live testnet MON balance + arcade demo credits
  const parsedWalletBalance = balance ? parseFloat(balance) : 0;
  const effectiveBalance = Number((parsedWalletBalance + sessionCredits).toFixed(3));

  const winRate =
    totalGamesPlayed > 0 ? Math.round((totalWins / totalGamesPlayed) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* High-Performance Terminal Header */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 -mt-20 h-56 w-96 rounded-full bg-[#7053F5]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Title & Subtitle */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FFA3] font-bold">
                Monad Testnet · Parallel Execution Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2.5">
              <Gamepad2 className="h-7 w-7 text-[#7053F5] shrink-0" />
              <span>Monad Arcade: On-Chain Prediction Games</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Test your intuition on high-speed parallel execution with zero financial risk using Monad Testnet MON.
            </p>
          </div>

          {/* Connected Wallet Status & Balance Badge */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-[#13161F] border border-[#171922] p-2.5 sm:p-3 rounded-2xl font-mono shrink-0">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-[#1E2230]">
                  <div className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
                  <span className="text-xs text-white font-bold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-[#1E2230]">
                  <Coins className="h-3.5 w-3.5 text-[#00FFA3]" />
                  <span className="text-xs text-slate-400">Balance:</span>
                  <span className="text-xs text-white font-bold">{effectiveBalance} MON</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7053F5]/20 border border-[#7053F5]/40 text-[#7053F5]">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-white">{currentStreak} Streak</span>
                </div>

                <button
                  type="button"
                  onClick={handleClaimFaucet}
                  title="Claim 5.0 Arcade Testnet MON for instant testing"
                  className="px-2.5 py-1.5 rounded-xl bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 border border-[#00FFA3]/30 text-[11px] font-bold text-[#00FFA3] transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>+5.0 Faucet</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white text-xs font-bold transition shadow-[0_0_15px_rgba(112,83,245,0.4)] cursor-pointer"
              >
                <MetaMaskLogo size={16} />
                <span>Connect MetaMask</span>
              </button>
            )}
          </div>
        </div>

        {/* Faucet Notification Feedback */}
        {hasClaimedFaucet && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Success: +5.000 MON Arcade Testnet credits deposited to your session balance!</span>
          </div>
        )}

        {/* Arcade HUD Quick Stats Bar */}
        <div className="mt-6 pt-5 border-t border-[#171922] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#13161F] border border-[#171922]">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Consecutive Streak
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {currentStreak}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Best: {bestStreak})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13161F] border border-[#171922]">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Win Rate
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy className="h-4 w-4 text-[#F5A623]" />
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {winRate}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({totalWins}/{totalGamesPlayed})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13161F] border border-[#171922]">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Net Arcade PnL
            </span>
            <div className="flex items-center gap-1 mt-1 font-mono">
              <span
                className={`text-base sm:text-lg font-bold ${
                  netProfitMon >= 0 ? "text-[#00FFA3]" : "text-[#FF4D4D]"
                }`}
              >
                {netProfitMon >= 0 ? "+" : ""}
                {netProfitMon.toFixed(3)} MON
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13161F] border border-[#171922] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Monad Parallel RPC
            </span>
            <div className="flex items-center justify-between text-xs font-mono text-[#00FFA3] mt-1">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                Sub-Second Finality
              </span>
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                Faucet <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Gating Prompt if Disconnected */}
      {!isConnected && (
        <div className="rounded-2xl border border-[#7053F5]/30 bg-[#7053F5]/10 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7053F5]/20 border border-[#7053F5]/40 text-[#7053F5] shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">MetaMask Wallet Required</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Connect your MetaMask wallet to initialize your testnet balance and play Monad Arcade games.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={connectWallet}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-mono font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(112,83,245,0.4)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MetaMaskLogo size={16} />
            <span>Connect MetaMask</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs (Tab 1: Even or Odd Dice, Tab 2: Live Market Action) */}
      <div className="flex items-center gap-2 border-b border-[#171922] pb-4 font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("dice")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "dice"
              ? "bg-[#7053F5] text-white shadow-[0_0_20px_rgba(112,83,245,0.5)] border border-[#7053F5]"
              : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922] hover:border-slate-700"
          }`}
        >
          <Dices className="h-4 w-4" />
          <span>Even or Odd Dice</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTab === "dice" ? "bg-white/20 text-white" : "bg-[#7053F5]/20 text-[#7053F5]"
            }`}
          >
            1.95x
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("price")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "price"
              ? "bg-[#7053F5] text-white shadow-[0_0_20px_rgba(112,83,245,0.5)] border border-[#7053F5]"
              : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922] hover:border-slate-700"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Live Market Action</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTab === "price" ? "bg-white/20 text-white" : "bg-[#00FFA3]/20 text-[#00FFA3]"
            }`}
          >
            30s Turbo
          </span>
        </button>
      </div>

      {/* State-Preserved Game Container */}
      <div className="min-h-[450px]">
        {/* Game 1: Even & Odd Dice */}
        <div className={activeTab === "dice" ? "block" : "hidden"}>
          <EvenOddDice
            currentStreak={currentStreak}
            onStreakUpdate={handleStreakUpdate}
            onBalanceAdjust={handleBalanceAdjust}
            effectiveBalance={effectiveBalance}
            onClaimFaucetCredits={handleClaimFaucet}
          />
        </div>

        {/* Game 2: Live Market Action Price Prediction */}
        <div className={activeTab === "price" ? "block" : "hidden"}>
          <PricePrediction
            currentStreak={currentStreak}
            onStreakUpdate={handleStreakUpdate}
            onBalanceAdjust={handleBalanceAdjust}
            effectiveBalance={effectiveBalance}
            onClaimFaucetCredits={handleClaimFaucet}
          />
        </div>
      </div>
    </div>
  );
}
