"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Users, Flame, Clock, Zap, ArrowUpRight } from "lucide-react";
import { EcosystemStats } from "@/types/token";

interface EcosystemPulseProps {
  stats: EcosystemStats;
  onSelectTopToken?: (tokenSymbol: string) => void;
}

export const EcosystemPulse: React.FC<EcosystemPulseProps> = ({
  stats,
  onSelectTopToken,
}) => {
  const [liveLatency, setLiveLatency] = useState(stats.avgFinality);
  const [liveTps, setLiveTps] = useState(stats.tpsCurrent);

  // Subtle real-time fluctuation to showcase Monad's live 10k TPS heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      const latencyJitter = 0.8 + Math.random() * 0.05;
      const tpsJitter = Math.floor(9800 + Math.random() * 450);
      setLiveLatency(Number(latencyJitter.toFixed(2)));
      setLiveTps(tpsJitter);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. 24h Monad Ecosystem Volume */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2230] bg-[#12141C] p-4 transition-all hover:border-[#7053F5]/40 hover:bg-[#151824]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">24h Monad Volume</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7053F5]/10 text-[#7053F5]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            ${(stats.volume24h / 1_000_000).toFixed(1)}M
          </span>
          <span className="flex items-center text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +24.8%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>DEX Swaps + Bridged</span>
          <span className="font-mono text-slate-400">4.38M MON</span>
        </div>
        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-[#7053F5]/5 blur-xl pointer-events-none" />
      </div>

      {/* 2. Active Smart Wallets */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2230] bg-[#12141C] p-4 transition-all hover:border-emerald-500/40 hover:bg-[#151824]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Smart Wallets</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            {stats.activeSmartWallets.toLocaleString()}
          </span>
          <span className="flex items-center text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> +142 today
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tracked Snipers & Whales</span>
          <span className="font-mono text-slate-400">84.2% Win Rate</span>
        </div>
        <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
      </div>

      {/* 3. Top Alpha Breakout */}
      <div
        onClick={() => onSelectTopToken && onSelectTopToken(stats.topAlphaToken)}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#7053F5]/30 bg-gradient-to-br from-[#12141C] to-[#17152B] p-4 transition-all hover:border-[#7053F5] hover:shadow-[0_0_20px_rgba(112, 83, 245,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-300">Top Alpha Breakout</span>
          </div>
          <span className="rounded bg-[#7053F5] px-2 py-0.5 font-mono text-[11px] font-black text-white shadow">
            {stats.topAlphaScore}/100
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-2xl font-black text-white group-hover:text-[#7053F5] transition-colors">
            {stats.topAlphaToken}
          </span>
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            +142% 1h
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Driver: Whale Accumulation</span>
          <span className="text-[#7053F5] font-medium group-hover:underline">Inspect →</span>
        </div>
        <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-[#7053F5]/10 blur-xl pointer-events-none" />
      </div>

      {/* 4. Finality & TPS Latency */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2230] bg-[#12141C] p-4 transition-all hover:border-purple-500/40 hover:bg-[#151824]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#7053F5]" />
            <span className="text-xs font-medium text-slate-400">Finality Latency</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Optimal</span>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            {liveLatency}s
          </span>
          <span className="font-mono text-xs font-medium text-slate-400">
            sub-second finality
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <Zap className="h-3 w-3 text-amber-400" /> Monad TPS
          </span>
          <span className="font-mono font-bold text-slate-200">
            {liveTps.toLocaleString()} tx/s
          </span>
        </div>
        <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-purple-500/5 blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
