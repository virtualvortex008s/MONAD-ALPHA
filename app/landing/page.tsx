"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MonadLogo } from "@/components/MonadLogo";
import { openHandbook } from "@/components/FloatingHandbook";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const marqueeItems = [
    { label: "SMART MONEY", text: "→ $SPIRE accumulation", type: "smart" },
    { label: "◆", text: "Alpha Score MONX: 72 → 88", type: "score" },
    { label: "◆", text: "VOLUME SPIKE: FLUX +380%", type: "volume" },
    { label: "◆", text: "0x44...F3B → BUY 1.76M MONX", type: "buy" },
    { label: "SMART MONEY", text: "→ $ECHO whale inflow $212K", type: "smart" },
    { label: "◆", text: "Alpha Score CHOG: 82 → 91", type: "score" },
    { label: "◆", text: "ACCUMULATION: 8 wallets into $SPIRE", type: "volume" },
  ];

  return (
    <div className="min-h-screen bg-[#060709] text-[#E2E8F0] selection:bg-[#7053F5]/30 selection:text-white flex flex-col relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#7053F5]/15 via-[#7053F5]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-[#00FFA3]/5 blur-3xl pointer-events-none" />

      {/* Top Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-[#171922] bg-[#060709]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7053F5]/20 border border-[#7053F5]/40 shadow-[0_0_15px_rgba(112, 83, 245,0.35)] group-hover:scale-105 transition-transform">
              <span className="font-mono font-black text-sm text-[#7053F5]">[M]</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">MONAD</span>
              <span className="font-mono font-bold text-base text-[#7053F5]">ALPHA</span>
              <span className="rounded bg-[#7053F5]/15 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#7053F5] border border-[#7053F5]/30 ml-1">
                BETA
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition">Dashboard</Link>
            <Link href="/new-launches" className="hover:text-white transition">Alpha Scanner</Link>
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <button
              type="button"
              onClick={() => openHandbook()}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              Docs & Guide
            </button>
          </nav>

          {/* Right Status Pill + Launch App CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#171922] bg-[#0D0F14] px-3 py-1 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-[#00FFA3] font-semibold text-[11px]">Live - Monad Testnet</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg bg-[#7053F5] hover:bg-[#5E3FEB] px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(112, 83, 245,0.35)] hover:shadow-[0_0_22px_rgba(112, 83, 245,0.55)] transition-all active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Marquee Signal Strip */}
      <div className="w-full bg-[#120F26] border-y border-[#171922] py-2 px-4 overflow-hidden relative">
        <div className="flex items-center max-w-7xl mx-auto">
          <div className="shrink-0 flex items-center gap-2 pr-4 border-r border-[#7053F5]/30 z-10 bg-[#120F26]">
            <span className="flex h-2 w-2 rounded-full bg-[#00FFA3] animate-ping" />
            <span className="rounded bg-[#7053F5] px-2 py-0.5 text-[10px] font-mono font-black text-white uppercase tracking-wider">
              LIVE
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative ml-4">
            <div className="flex whitespace-nowrap animate-marquee gap-8 text-xs font-mono">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className={item.type === "smart" ? "text-[#7053F5] font-bold" : "text-[#00FFA3] font-bold"}>
                    {item.label}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7053F5]/40 bg-[#7053F5]/10 px-3.5 py-1 text-xs font-mono text-[#7053F5]">
              <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span>Monad-native on-chain intelligence — Now in Beta</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1]">
              See the Alpha{" "}
              <span className="bg-gradient-to-r from-[#7053F5] via-[#9F8CFF] to-[#6C52EE] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(112, 83, 245,0.5)]">
                Before the Market.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Monad Alpha transforms raw on-chain activity into actionable intelligence. Track smart money,
              detect whale movements, and discover alpha before it moves the market.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(112,83,245,0.45)] hover:shadow-[0_0_35px_rgba(112,83,245,0.65)] transition-all active:scale-95"
              >
                <span>Launch Monad Alpha</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/new-launches"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#171922] bg-[#0D0F14] hover:bg-[#13161F] px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white transition-all hover:border-slate-700"
              >
                <Activity className="h-4 w-4 text-[#7053F5]" />
                <span>Explore Alpha Scanner</span>
              </Link>
            </div>

            {/* Key ecosystem stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#171922] text-center lg:text-left font-mono">
              <div>
                <span className="text-xl font-black text-white block">10,000</span>
                <span className="text-[11px] text-slate-500 uppercase">Sub-second TPS</span>
              </div>
              <div>
                <span className="text-xl font-black text-[#00FFA3] block">1,482</span>
                <span className="text-[11px] text-slate-500 uppercase">Tracked Whales</span>
              </div>
              <div>
                <span className="text-xl font-black text-[#7053F5] block">100%</span>
                <span className="text-[11px] text-slate-500 uppercase">EVM Compatible</span>
              </div>
            </div>
          </div>

          {/* Hero Right Graphic Cluster */}
          <div className="lg:col-span-6 relative min-h-[460px] flex items-center justify-center">
            {/* Ambient Purple Radial Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7053F5]/10 via-[#00FFA3]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            {/* Center Node Orbit Graph with SVG Satellites */}
            <div className="relative w-full max-w-[480px] h-[460px] flex items-center justify-center">
              {/* SVG Orbit Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 480 460">
                <circle cx="240" cy="230" r="140" stroke="#171922" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <circle cx="240" cy="230" r="85" stroke="#7053F5" strokeWidth="1" strokeOpacity="0.2" fill="none" />
                <line x1="240" y1="230" x2="80" y2="90" stroke="#7053F5" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="240" y1="230" x2="400" y2="100" stroke="#00FFA3" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="240" y1="230" x2="100" y2="380" stroke="#7053F5" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="240" y1="230" x2="390" y2="360" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
              </svg>

              {/* Center Core Node: $MONX */}
              <div className="relative z-20 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-[#0D0F14] border-2 border-[#7053F5] shadow-[0_0_35px_rgba(112, 83, 245,0.4)]">
                <MonadLogo size={32} className="rounded-full shadow-lg" />
                <span className="font-bold text-xs text-white mt-1">$MONX</span>
                <span className="font-mono text-[9px] text-[#00FFA3] font-semibold">+18.4%</span>
              </div>

              {/* Orbiting Satellite Node 1: $FLUX */}
              <div className="absolute top-12 left-12 z-20 flex items-center gap-1.5 rounded-full bg-[#0D0F14] border border-[#171922] px-2.5 py-1 shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                <span className="font-mono text-[10px] text-white font-bold">$FLUX</span>
              </div>

              {/* Orbiting Satellite Node 2: $ECHO */}
              <div className="absolute top-14 right-10 z-20 flex items-center gap-1.5 rounded-full bg-[#0D0F14] border border-[#171922] px-2.5 py-1 shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3]" />
                <span className="font-mono text-[10px] text-white font-bold">$ECHO</span>
              </div>

              {/* Orbiting Satellite Node 3: $SPIRE */}
              <div className="absolute bottom-12 right-14 z-20 flex items-center gap-1.5 rounded-full bg-[#0D0F14] border border-[#171922] px-2.5 py-1 shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7053F5]" />
                <span className="font-mono text-[10px] text-white font-bold">$SPIRE</span>
              </div>

              {/* Floating Card 1: SMART MONEY (Top Left) */}
              <div className="absolute -top-4 -left-6 z-30 w-56 rounded-xl border border-[#171922] bg-[#0D0F14]/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#7053F5] border border-[#7053F5]/30">
                    SMART MONEY
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">2m ago</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ScoreGauge score={88} size={42} strokeWidth={3.5} />
                  <div>
                    <span className="text-xs font-bold text-white block">$MONX Accumulation</span>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      5 wallets accumulated 2.4% supply in 18 min
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2: ALPHA SCORE (Top Right) */}
              <div className="absolute -top-2 -right-4 z-30 w-52 rounded-xl border border-[#171922] bg-[#0D0F14]/95 p-3 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>ALPHA SCORE</span>
                  <span className="text-[#00FFA3] font-bold">↑ from 72 · +18%</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="text-2xl font-black text-white font-mono">88</span>
                  <span className="text-xs text-slate-500 font-mono">/100</span>
                </div>
                <div className="w-full h-1.5 bg-[#171922] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFA3] rounded-full shadow-[0_0_10px_#00FFA3]" style={{ width: "88%" }} />
                </div>
              </div>

              {/* Floating Card 3: WHALE ALERT (Bottom Left) */}
              <div className="absolute -bottom-6 -left-4 z-30 w-60 rounded-xl border border-[#171922] bg-[#0D0F14]/95 p-3 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-bold">WHALE ALERT</span>
                  <span className="text-slate-500 ml-auto">32s ago</span>
                </div>
                <div className="text-xs font-bold text-white">
                  $212,400 ECHO
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  0x82...19F (Single TX on MonadFi)
                </div>
              </div>

              {/* Floating Card 4: Terminal Scanner Box (Bottom Right) */}
              <div className="absolute -bottom-8 -right-6 z-30 w-56 rounded-xl border border-[#171922] bg-[#0A0C11] p-3 shadow-2xl font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-500 pb-1.5 mb-1.5 border-b border-[#171922]">
                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span className="ml-1 text-[9px] text-slate-400">scanner</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="text-slate-400">▶ Scanning Monad...</div>
                  <div className="text-[#00FFA3] flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 text-[#00FFA3]" />
                    <span>Smart Money detected</span>
                  </div>
                  <div className="text-slate-200">+ Score: 88/100</div>
                  <div className="text-[#7053F5] flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-[#7053F5]" />
                    <span>⚡ New signal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="border-t border-[#171922] bg-[#0D0F14]/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Monad's Parallel Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Process 10,000 transactions per second without losing mempool granularity or token flow clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-6 hover:border-[#7053F5]/50 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7053F5]/20 text-[#7053F5] mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">Sub-Second Mempool Signals</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Receive instant notifications when smart wallets execute swaps or launch initial liquidity pools across Monad DEXes.
              </p>
            </div>

            <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-6 hover:border-[#00FFA3]/50 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00FFA3]/20 text-[#00FFA3] mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">AI-Synthesized Alpha Scores</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Gemini Flash AI dynamically synthesizes dev wallet histories, holder clusters, and volume anomalies into a unified 0–100 score.
              </p>
            </div>

            <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-6 hover:border-amber-500/50 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">Automated Bytecode Security</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Simulate anti-honeypot, LP burn status, and owner renouncement before you commit testnet capital.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
