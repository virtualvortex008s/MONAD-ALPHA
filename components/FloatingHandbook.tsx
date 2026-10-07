"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  X,
  Maximize2,
  Minimize2,
  Search,
  Zap,
  ShieldCheck,
  Wallet,
  Bot,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Coins,
  Flame,
  Layers,
  Lock,
  ArrowRight,
  HelpCircle,
  Info,
  Percent,
  ShieldAlert,
  Clock,
  Activity,
  Cpu,
} from "lucide-react";

export const openHandbook = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-handbook"));
  }
};

export const FloatingHandbook: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("quickstart");
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-handbook", handleOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-handbook", handleOpen);
    };
  }, []);

  const chapters = [
    {
      id: "quickstart",
      title: "1. Quickstart Guide",
      subtitle: "3-step platform walkthrough",
      icon: <Zap className="w-4 h-4 text-[#7053F5]" />,
      badge: "BEGINNER",
      badgeColor: "bg-[#7053F5]/20 text-[#7053F5] border-[#7053F5]/30",
    },
    {
      id: "scoring",
      title: "2. The Alpha Score",
      subtitle: "Progression & tiers (0-100)",
      icon: <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />,
      badge: "ESSENTIAL",
      badgeColor: "bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30",
    },
    {
      id: "glossary",
      title: "3. Web3 & DeFi Glossary",
      subtitle: "LP, MON, TPS & key terms",
      icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
      badge: "TERMINOLOGY",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      id: "radar",
      title: "4. Radar & Smart Flow",
      subtitle: "Finding breakouts & whale flow",
      icon: <Search className="w-4 h-4 text-amber-400" />,
    },
    {
      id: "gemini-ai",
      title: "5. Gemini Flash AI",
      subtitle: "Automated on-chain dossiers",
      icon: <Bot className="w-4 h-4 text-[#7053F5]" />,
    },
    {
      id: "metamask",
      title: "6. MetaMask & Faucet",
      subtitle: "Wallet setup & free testnet MON",
      icon: <ExternalLink className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* 1. FLOATING TRIGGER GROUP (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 max-w-[calc(100vw-32px)]">
          {/* INITIAL WELCOME CALLOUT BUBBLE */}
          {showPrompt && (
            <div className="animate-bounce duration-1000 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#7053F5] text-white text-[10px] sm:text-[11px] font-semibold shadow-xl shadow-[#7053F5]/30 border border-white/20 relative max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shrink-0"></span>
              <span className="truncate">👋 New to Web3 & Monad? Start here!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="ml-1 text-white/70 hover:text-white transition p-0.5 rounded cursor-pointer"
                title="Dismiss prompt"
                aria-label="Dismiss prompt"
              >
                ✕
              </button>
              {/* Downward arrow tip pointing to book button */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#7053F5] rotate-45 border-r border-b border-white/20"></div>
            </div>
          )}

          {/* THE FLOATING BOOK BUTTON */}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowPrompt(false);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#12141C] border border-[#7053F5]/60 hover:border-[#7053F5] text-white text-xs font-semibold shadow-2xl shadow-[#7053F5]/30 hover:shadow-[#7053F5]/50 transition-all flex items-center gap-2 sm:gap-2.5 group backdrop-blur-md cursor-pointer"
            aria-label="Open Monad Alpha Handbook"
          >
            {/* Glowing Book Icon */}
            <div className="w-6 h-6 rounded-full bg-[#7053F5]/20 border border-[#7053F5]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-[#7053F5]" />
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold">Handbook</span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-[#7053F5] text-[11px] font-bold hidden sm:inline">Start Here ✦</span>
            </div>

            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse"></span>
          </button>
        </div>
      )}

      {/* 2. DOCUMENT-STYLE READER MODAL */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#0D0F14]/98 border border-[#171922] rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMaximized
              ? "inset-2 sm:inset-4 md:inset-8"
              : "bottom-4 right-4 w-[calc(100vw-32px)] max-h-[88vh] sm:bottom-6 sm:right-6 sm:w-full sm:max-w-3xl sm:h-[720px] sm:max-h-[90vh]"
          }`}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-[#171922] bg-[#0A0C11] flex items-center justify-between gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#7053F5]/20 border border-[#7053F5]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(112,83,245,0.3)]">
                <BookOpen className="w-4 h-4 text-[#7053F5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                    MONAD ALPHA HANDBOOK
                  </h2>
                  <span className="text-[10px] font-mono text-[#00FFA3] px-1.5 py-0.5 rounded bg-[#00FFA3]/10 border border-[#00FFA3]/30 font-bold shrink-0">
                    BEGINNER READY
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  Zero Trading Experience Required · Monad Testnet Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden sm:inline-flex p-2 rounded-lg hover:bg-[#191C27] text-slate-400 hover:text-white transition cursor-pointer"
                title={isMaximized ? "Collapse view" : "Expand to fullscreen"}
                aria-label="Toggle Fullscreen"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-[#191C27] text-slate-400 hover:text-white transition cursor-pointer"
                title="Close (Esc)"
                aria-label="Close Handbook"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick-Pill Navigation for Mobile & Compact Screens */}
          <div className="border-b border-[#171922] bg-[#060709] px-3 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0 lg:hidden">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setActiveTab(chapter.id)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === chapter.id
                    ? "bg-[#7053F5] text-white font-bold shadow-md shadow-[#7053F5]/30"
                    : "text-slate-400 bg-[#0D0F14] border border-[#171922] hover:text-white"
                }`}
              >
                {chapter.icon}
                <span>{chapter.title.split(". ")[1]}</span>
              </button>
            ))}
          </div>

          {/* Reader Body: Two-Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Desktop Left Sidebar Chapters (lg+) */}
            <div className="w-64 border-r border-[#171922] bg-[#0A0C11] p-3 hidden lg:flex flex-col gap-3 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search handbook..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0D0F14] border border-[#171922] rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7053F5] font-mono transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-2 pt-1 font-bold">
                Table of Contents
              </div>

              <div className="space-y-1 overflow-y-auto flex-1 pr-0.5">
                {filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveTab(chapter.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer flex flex-col gap-0.5 ${
                      activeTab === chapter.id
                        ? "bg-[#7053F5]/15 text-white border-l-2 border-[#7053F5] font-semibold shadow-[inset_0_0_12px_rgba(112,83,245,0.15)]"
                        : "text-slate-400 hover:bg-[#13161F] hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate font-medium">
                        {chapter.icon}
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      {chapter.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${chapter.badgeColor}`}
                        >
                          {chapter.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono pl-6 truncate">
                      {chapter.subtitle}
                    </span>
                  </button>
                ))}
              </div>

              {/* Faucet Quick Link in Sidebar */}
              <div className="pt-2 border-t border-[#171922]">
                <a
                  href="https://faucet.monad.xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0F14] border border-[#171922] hover:border-[#7053F5]/40 text-xs text-slate-300 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse"></span>
                    <span className="font-mono text-[11px] font-semibold">Official Faucet</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#7053F5] transition" />
                </a>
              </div>
            </div>

            {/* Main Reading Pane */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
              {/* ========================================================= */}
              {/* TAB 1: QUICKSTART: HOW TO USE MONAD ALPHA                 */}
              {/* ========================================================= */}
              {activeTab === "quickstart" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7053F5] uppercase tracking-wider mb-1">
                      <Zap className="w-4 h-4 text-[#7053F5]" />
                      <span>Tab 1 · Getting Started</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Quickstart: How to Use Monad Alpha
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      Master Monad Alpha in 3 simple, non-intimidating steps. Designed specifically for
                      first-time Web3 participants with zero prior trading background.
                    </p>
                  </div>

                  {/* Zero-Risk Peace of Mind Banner */}
                  <div className="p-4 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-slate-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#00FFA3] font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#00FFA3] shrink-0" />
                      <span>100% Free · Zero Financial Risk Guaranteed</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      You are using the <strong>Monad Testnet</strong> (Chain ID: <code className="text-white font-mono bg-[#0D0F14] px-1 py-0.5 rounded">10143</code>).
                      All tokens, trades, and balances in this application are completely free simulation assets. No credit card, real fiat, or personal identification is ever required.
                    </p>
                  </div>

                  {/* 3 Step Walkthrough Cards */}
                  <div className="space-y-3.5">
                    {/* Step 1 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] hover:border-[#7053F5]/40 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#7053F5] text-white font-black font-mono text-xs shadow-md shadow-[#7053F5]/30">
                            1
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            Connect Your Wallet (Desktop or Mobile)
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-full border border-[#00FFA3]/20 font-bold">
                          Step 1
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Click the purple <strong>&quot;Connect MetaMask&quot;</strong> button in the top navigation bar. If you are on a mobile device without an extension, tapping the button seamlessly launches the MetaMask mobile app via a verified Universal Deep Link.
                      </p>
                      <div className="p-3 rounded-xl bg-[#060709] border border-[#171922] text-[11px] font-mono text-slate-400 space-y-1">
                        <div className="text-slate-300 font-semibold">Automatic Network Setup:</div>
                        <p>
                          MetaMask will automatically prompt to add and switch to <strong>Monad Testnet</strong> (Chain ID: <code>10143</code>). You will then approve a free, gasless signature handshake to verify your browser session.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] hover:border-[#7053F5]/40 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#7053F5] text-white font-black font-mono text-xs shadow-md shadow-[#7053F5]/30">
                            2
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            View Your Live On-Chain Footprint
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-full border border-[#00FFA3]/20 font-bold">
                          Step 2
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        As soon as your wallet connects, Monad Alpha queries the Monad validator network in real-time. Navigate to the <strong>Portfolio</strong> tab to view:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                        <li className="p-2.5 rounded-xl bg-[#060709] border border-[#171922] text-slate-300">
                          <span className="text-[#00FFA3] font-bold block mb-0.5">Native MON</span>
                          Total testnet funds in your wallet
                        </li>
                        <li className="p-2.5 rounded-xl bg-[#060709] border border-[#171922] text-slate-300">
                          <span className="text-[#7053F5] font-bold block mb-0.5">Verified Nonce</span>
                          True on-chain transaction count
                        </li>
                        <li className="p-2.5 rounded-xl bg-[#060709] border border-[#171922] text-slate-300">
                          <span className="text-blue-400 font-bold block mb-0.5">Activity Score</span>
                          Your real-time 0–100 ranking
                        </li>
                      </ul>
                    </div>

                    {/* Step 3 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] hover:border-[#7053F5]/40 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#7053F5] text-white font-black font-mono text-xs shadow-md shadow-[#7053F5]/30">
                            3
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            Generate Your Gemini AI Intelligence Dossier
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-full border border-[#00FFA3]/20 font-bold">
                          Step 3
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Click on any token in the <strong>Alpha Radar</strong> or click <strong>&quot;Generate AI Dossier&quot;</strong>. Google Gemini (<code>gemini-2.0-flash</code>) parses the raw blockchain telemetry and creates a structured, institutional intelligence brief:
                      </p>
                      <div className="p-3.5 rounded-xl bg-[#060709] border border-[#7053F5]/30 font-mono text-[11px] space-y-1.5">
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-[#7053F5]" />
                          <span>What Gemini AI Delivers to You:</span>
                        </div>
                        <ul className="space-y-1 text-slate-400 pl-4 list-disc">
                          <li>Plain-English translation of why a token is rising or falling.</li>
                          <li>Whale accumulation vs. retail dump alerts.</li>
                          <li>Rug-pull &amp; liquidity safety checks (LP lock verification).</li>
                          <li>Buyer-to-seller ratio analysis (detecting artificial wash trading).</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Next Step CTA */}
                  <div className="p-4 rounded-2xl bg-[#0A0C11] border border-[#171922] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-white text-xs">Ready to check your reputation?</h5>
                      <p className="text-[11px] text-slate-400">
                        Proceed to Tab 2 to understand how your Alpha Score progresses from 0 to 100.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("scoring")}
                      className="px-4 py-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <span>Explore Alpha Score</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: THE ALPHA SCORE: HOW IT MOVES FROM 0 TO 100       */}
              {/* ========================================================= */}
              {activeTab === "scoring" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FFA3] uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
                      <span>Tab 2 · Reputation &amp; Progression Engine</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      The Alpha Score: How It Moves from 0 to 100
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      Transparent mathematical mechanics. Learn what actions elevate your standing,
                      how the 4 tiers work, and what behaviors trigger automated penalties.
                    </p>
                  </div>

                  {/* What the Score Means Callout */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#7053F5]" />
                      <span>What the Alpha Score Represents</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The <strong>Alpha Score</strong> is a dynamic <strong>0–100 reputation score</strong> calculated directly from verified on-chain state. It measures how organically, consistently, and actively you participate in the high-speed Monad blockchain ecosystem. A higher score unlocks institutional analytics, top accumulator badges, and ecosystem recognition.
                    </p>
                  </div>

                  {/* The 4 Reputation Tiers */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      The 4 Progression Tiers
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                      {/* Tier 1 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold text-xs">TIER 1</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                            Score: 0 – 29
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">New Explorer</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                          Brand new wallet, just funded from a testnet faucet, or minimal transaction history. Baseline reputation.
                        </p>
                      </div>

                      {/* Tier 2 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-blue-500/30 bg-blue-500/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-bold text-xs">TIER 2</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/40">
                            Score: 30 – 59
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">Active Pioneer</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          Regular user who maintains a MON balance, explores multiple decentralized apps, and returns across several days.
                        </p>
                      </div>

                      {/* Tier 3 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#7053F5]/40 bg-[#7053F5]/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#7053F5] font-bold text-xs">TIER 3</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#7053F5]/20 text-[#7053F5] text-[10px] font-bold border border-[#7053F5]/40">
                            Score: 60 – 84
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">High-Velocity Operator</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          Seasoned tester interacting with multiple smart contracts, swapping on DEXs, and retaining capital in the network.
                        </p>
                      </div>

                      {/* Tier 4 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#00FFA3]/40 bg-[#00FFA3]/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#00FFA3] font-bold text-xs">TIER 4</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#00FFA3]/20 text-[#00FFA3] text-[10px] font-bold border border-[#00FFA3]/40">
                            Score: 85 – 100
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">Monad Alpha Chad</h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          Elite on-chain participant exhibiting top-tier velocity, liquidity depth, staking, and broad multi-contract exploration.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exactly How to Increase Your Score */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00FFA3]" />
                      <span>Weighted Actions That Raise Your Score</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Factor 1 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Transaction Consistency</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#00FFA3]/15 text-[#00FFA3] font-mono text-xs font-black">
                            +30% Weight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Making regular transactions over multiple days rather than doing 20 transactions in one minute and never returning. The engine favors sustained, organic human usage.
                        </p>
                      </div>

                      {/* Factor 2 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Protocol Diversity</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#7053F5]/20 text-[#7053F5] font-mono text-xs font-black">
                            +25% Weight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Interacting with different decentralized applications (swapping on DEXs, testing NFT mints, staking) rather than merely sending tokens back and forth between your own wallets.
                        </p>
                      </div>

                      {/* Factor 3 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Holding Native MON</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-black">
                            +25% Weight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Keeping a healthy balance of native MON in your wallet rather than immediately dumping or draining it to zero. Capital retention proves economic conviction.
                        </p>
                      </div>

                      {/* Factor 4 */}
                      <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Ecosystem Depth &amp; Liquidity</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-black">
                            +20% Weight
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Providing liquidity to decentralized pools (acting as an LP). Depositing capital shows real commitment to bootstrapping the Monad financial backbone.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Penalties & Red Flags */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>What Lowers or Penalizes Your Score</span>
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>
                          <strong>Repetitive Bot-Like Loops:</strong> Sending automated micro-transactions with identical zero values in rapid succession triggers the anti-sybil flag.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>
                          <strong>Faucet Drain &amp; Dump:</strong> Receiving testnet tokens and immediately forwarding 100% of them to a central farm wallet flags the account as non-organic.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: BEGINNER'S WEB3 & DEFI GLOSSARY                    */}
              {/* ========================================================= */}
              {activeTab === "glossary" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1">
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <span>Tab 3 · Plain-English Terminology</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Beginner&apos;s Web3 &amp; DeFi Glossary
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      Crypto buzzwords decoded into plain English with everyday analogies. Never feel lost
                      looking at decentralized finance metrics again.
                    </p>
                  </div>

                  {/* Glossary Items List */}
                  <div className="space-y-3.5">
                    {/* Item 1: LP */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#7053F5]/30 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-[#7053F5]" />
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            LP (Liquidity Provider / Liquidity Pool)
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#7053F5]/20 text-[#7053F5] border border-[#7053F5]/30">
                          CORE CONCEPT
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#060709] border border-[#171922] space-y-1.5 text-xs">
                        <span className="font-bold text-[#00FFA3] font-mono text-[11px] block">
                          🏦 Plain English Analogy:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          In traditional finance, a centralized bank or stock brokerage matches buyers and sellers. In DeFi, there is no middleman bank. Instead, everyday users deposit pairs of tokens (like <strong>MON and USDT</strong>) into a shared digital vault called a <strong>Liquidity Pool</strong>. Traders can then instantly trade against this pool 24/7 without waiting for a counterpart.
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <span className="font-bold text-white font-mono text-[11px] block">
                          ⚡ Why It Matters to You:
                        </span>
                        <p className="leading-relaxed text-slate-400">
                          When you deposit tokens to become an LP, you earn a proportional share of every trading fee generated whenever anyone swaps on that pool. In Monad Alpha, having LP activity demonstrates that you are financing the network&apos;s backbone, granting a major boost to your <strong>Alpha Score</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Item 2: MON */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#7053F5]"></span>
                          MON (Native Token)
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">Gas Asset</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The native gas and governance currency of the Monad blockchain. Every time you send a transaction, swap, or interact with a contract, a tiny fraction of MON (often &lt;0.001 MON) is consumed as network gas to reward validators.
                      </p>
                    </div>

                    {/* Item 3: Testnet vs Mainnet */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00FFA3]"></span>
                          Testnet vs. Mainnet
                        </h4>
                        <span className="text-[10px] font-mono text-[#00FFA3]">Risk-Free</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A <strong>Testnet</strong> is a simulated, risk-free testing sandbox where tokens have zero monetary value. Developers and users test apps, discover bugs, and stress-test performance without losing real money. <strong>Mainnet</strong> is the final production blockchain with real financial capital.
                      </p>
                    </div>

                    {/* Item 4: 10,000 TPS & Parallel Execution */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-purple-400" />
                          10,000 TPS &amp; Parallel Execution
                        </h4>
                        <span className="text-[10px] font-mono text-purple-400">Technology</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Traditional blockchains like Ethereum execute transactions one by one in a single line (sequential). Monad introduces <strong>parallel execution</strong>, allowing up to 10,000 transactions to be computed simultaneously across multiple CPU cores, achieving sub-second block confirmations without network congestion.
                      </p>
                    </div>

                    {/* Item 5: Smart Contract */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-400" />
                          Smart Contract
                        </h4>
                        <span className="text-[10px] font-mono text-blue-400">Code on Chain</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Self-executing computer programs stored directly on the blockchain. When conditions are met (e.g. &quot;swap 5 MON for 100 CHOG&quot;), the code executes automatically without human intermediaries.
                      </p>
                    </div>

                    {/* Item 6: AI Dossier */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#7053F5]" />
                          AI Intelligence Dossier
                        </h4>
                        <span className="text-[10px] font-mono text-[#7053F5]">Google Gemini</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A personalized intelligence brief generated by <strong>Google Gemini</strong> that takes raw on-chain hashes, wallet counts, and liquidity numbers and translates them into actionable, plain-English advice.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: RADAR & SMART FLOW                                 */}
              {/* ========================================================= */}
              {activeTab === "radar" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <Search className="w-4 h-4 text-amber-400" />
                      <span>Tab 4 · Discovery Terminal</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      The Alpha Radar &amp; Market Filters
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      How to filter high-velocity Monad tokens, track whale inflows, and avoid scams.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-3.5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1">
                      <span className="text-[#7053F5] font-bold block">🔥 High Momentum</span>
                      <p className="text-slate-400 font-sans">
                        Tokens with Alpha Scores &gt;75 and trading volume expanding faster than 2x baseline.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1">
                      <span className="text-blue-400 font-bold block">🐋 Whale Inflows</span>
                      <p className="text-slate-400 font-sans">
                        Tokens where single transactions exceed $5,000 USD within the last 60 minutes.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1">
                      <span className="text-purple-400 font-bold block">🎯 Smart Snipes</span>
                      <p className="text-slate-400 font-sans">
                        Tokens actively bought by wallets with historical win rates &gt;80%.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-1">
                      <span className="text-[#00FFA3] font-bold block">🛡️ Low Risk (&lt;30)</span>
                      <p className="text-slate-400 font-sans">
                        Hides tokens with high deployer balances, unlocked liquidity, or dangerous contract permissions.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060709] border border-[#171922] flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 rounded bg-[#0D0F14] border border-[#171922] font-mono text-[10px] text-[#7053F5] font-bold">
                      PRO TIP
                    </span>
                    <span className="text-slate-300">
                      Click any token row in the dashboard to open the <strong>Slide-Over Intelligence Drawer</strong> without losing your scroll position.
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: GEMINI FLASH AI INTELLIGENCE                       */}
              {/* ========================================================= */}
              {activeTab === "gemini-ai" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7053F5] uppercase tracking-wider mb-1">
                      <Bot className="w-4 h-4 text-[#7053F5]" />
                      <span>Tab 5 · Artificial Intelligence</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Gemini Flash AI Intelligence
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      The institutional financial analyst integrated directly into the Monad Alpha terminal.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0F14] border border-[#7053F5]/40 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-[#7053F5]" /> AI DOSSIER: SAMPLE BREAKDOWN
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#7053F5] text-white font-bold">
                        GEMINI 2.0 FLASH
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#060709] border border-[#7053F5]/20 text-slate-200 text-xs leading-relaxed">
                      &quot;Breakout momentum driven by 84 tracked smart wallets accumulating +$894k USD.
                      Buyer-to-seller ratio is 4.8:1 with zero deployer sell pressure and 100% burned LP.&quot;
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922] text-[#00FFA3] font-bold">
                        ✔ 100% Verified Burned LP
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922] text-[#00FFA3] font-bold">
                        ✔ Top 10 hold only 14.2%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Powered by <strong>Gemini 2.0 Flash</strong>, the AI reads price action, transaction density, and holder concentration in real time, preventing you from falling victim to rugs or disguised sell walls.
                  </p>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: METAMASK SETUP & TESTNET FAUCET                    */}
              {/* ========================================================= */}
              {activeTab === "metamask" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>Tab 6 · Faucet &amp; Connectivity</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      MetaMask Setup &amp; Testnet Faucet
                    </h3>
                    <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                      Claim free testnet tokens and configure your wallet in under 60 seconds.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D0F14] border border-[#171922] space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      Monad Testnet RPC Credentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922]">
                        <span className="text-slate-500 block text-[10px]">Network Name</span>
                        <span className="text-white font-bold">Monad Testnet</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922]">
                        <span className="text-slate-500 block text-[10px]">Chain ID</span>
                        <span className="text-[#00FFA3] font-bold">10143 (0x279f)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922]">
                        <span className="text-slate-500 block text-[10px]">Currency Symbol</span>
                        <span className="text-[#7053F5] font-bold">MON</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#060709] border border-[#171922]">
                        <span className="text-slate-500 block text-[10px]">RPC URL</span>
                        <span className="text-slate-300 truncate block">https://testnet-rpc.monad.xyz</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#171922] space-y-3">
                    <h4 className="font-bold text-white text-xs">Claim Free Testnet $MON:</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Visit the official Monad faucet, paste your <code>0x...</code> wallet address, and receive free testnet MON within seconds to start trading and building your score:
                    </p>
                    <a
                      href="https://faucet.monad.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-[#7053F5]/30 active:scale-95"
                    >
                      <span>Open Official Monad Faucet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation Bar */}
          <div className="px-5 py-3 border-t border-[#171922] bg-[#0A0C11] flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
            <span className="hidden sm:inline">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[#0D0F14] border border-[#171922] text-[10px] text-slate-300">
                Esc
              </kbd>{" "}
              to close handbook
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition font-medium cursor-pointer"
              >
                Close Handbook ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHandbook;
