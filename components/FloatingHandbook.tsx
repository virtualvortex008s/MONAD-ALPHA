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
  const [activeTab, setActiveTab] = useState<string>("overview");
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
    { id: "overview", title: "1. Executive Overview", icon: <Zap className="w-4 h-4 text-[#7053F5]" /> },
    { id: "scoring", title: "2. The Scoring Engine", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: "radar", title: "3. The Radar & Filters", icon: <Search className="w-4 h-4 text-blue-400" /> },
    { id: "smart-money", title: "4. Smart Money & Whales", icon: <Wallet className="w-4 h-4 text-purple-400" /> },
    { id: "gemini-ai", title: "5. Gemini Flash AI", icon: <Bot className="w-4 h-4 text-[#7053F5]" /> },
    { id: "metamask", title: "6. MetaMask & Faucet", icon: <ExternalLink className="w-4 h-4 text-amber-400" /> },
  ];

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* 1. FLOATING TRIGGER GROUP (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {/* INITIAL WELCOME CALLOUT BUBBLE */}
          {showPrompt && (
            <div className="animate-bounce duration-1000 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#7053F5] text-white text-[11px] font-semibold shadow-xl shadow-[#7053F5]/30 border border-white/20 relative">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span>👋 New to Monad Alpha? Start here!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="ml-1 text-white/70 hover:text-white transition p-0.5 rounded"
                title="Dismiss prompt"
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
            className="px-4 py-2.5 rounded-full bg-[#12141C] border border-[#7053F5]/60 hover:border-[#7053F5] text-white text-xs font-semibold shadow-2xl shadow-[#7053F5]/30 hover:shadow-[#7053F5]/50 transition-all flex items-center gap-2.5 group backdrop-blur-md cursor-pointer"
          >
            {/* Glowing Book Icon */}
            <div className="w-6 h-6 rounded-full bg-[#7053F5]/20 border border-[#7053F5]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-[#7053F5]" />
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold">Handbook</span>
              <span className="text-slate-500">·</span>
              <span className="text-[#7053F5] text-[11px] font-bold">Start Here ✦</span>
            </div>

            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>
      )}

      {/* 2. DOCUMENT-STYLE READER MODAL */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#12141C]/98 border border-[#1E2230] rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMaximized
              ? "inset-4 md:inset-10"
              : "bottom-6 right-6 w-full max-w-2xl h-[700px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#1E2230] bg-[#0B0C10]/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7053F5]/20 border border-[#7053F5]/40 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#7053F5]" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                  MONAD ALPHA{" "}
                  <span className="text-[11px] font-mono text-[#7053F5] px-1.5 py-0.5 rounded bg-[#7053F5]/10 border border-[#7053F5]/20">
                    MANUAL v1.0
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Documentation & Visual User Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 rounded-lg hover:bg-[#191C27] text-slate-400 hover:text-white transition cursor-pointer"
                title={isMaximized ? "Collapse" : "Expand Fullscreen"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-[#191C27] text-slate-400 hover:text-white transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body: Two-Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Table of Contents */}
            <div className="w-56 border-r border-[#1E2230] bg-[#0B0C10]/40 p-3 hidden sm:flex flex-col gap-3 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12141C] border border-[#1E2230] rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#7053F5] font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              </div>

              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1">
                Chapters
              </div>

              <div className="space-y-1 overflow-y-auto flex-1">
                {filteredChapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveTab(chapter.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      activeTab === chapter.id
                        ? "bg-[#7053F5] text-white font-semibold shadow-md shadow-[#7053F5]/20"
                        : "text-slate-400 hover:bg-[#191C27] hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {chapter.icon}
                      <span className="truncate">{chapter.title}</span>
                    </div>
                    {activeTab === chapter.id && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Reading Pane */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
              {/* CHAPTER 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">1. Executive Overview</h3>
                    <p className="text-slate-400">
                      Understanding on-chain intelligence on the 10,000 TPS Monad L1.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#7053F5]/10 border border-[#7053F5]/30 text-slate-200">
                    💡 <strong>The Core Purpose:</strong> Monad produces thousands of swaps per
                    second with 1-second finality. Monad Alpha aggregates, scores, and summarizes
                    high-conviction events so you can make informed decisions in seconds.
                  </div>

                  {/* Architecture Flowchart */}
                  <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#1E2230] font-mono text-[11px] space-y-2">
                    <div className="text-slate-500 font-bold">MONAD ALPHA TELEMETRY PIPELINE:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded bg-[#12141C] border border-[#1E2230] text-purple-400">
                        1. Monad Blocks (10k TPS)
                      </div>
                      <div className="p-2 rounded bg-[#12141C] border border-[#1E2230] text-blue-400">
                        2. Event Indexer (DEX Swaps)
                      </div>
                      <div className="p-2 rounded bg-[#12141C] border border-[#1E2230] text-emerald-400">
                        3. Scoring Engine (Alpha / Risk)
                      </div>
                      <div className="p-2 rounded bg-[#7053F5]/20 border border-[#7053F5]/50 text-white font-bold">
                        4. Gemini Flash AI Dossier
                      </div>
                    </div>
                  </div>

                  <p>
                    Rather than forcing you to decode raw hex or hundreds of transactions, Monad
                    Alpha calculates two primary scores: the <strong>Alpha Score</strong>{" "}
                    (Opportunity) and the <strong>Risk Score</strong> (Safety).
                  </p>
                </div>
              )}

              {/* CHAPTER 2: SCORING ENGINE */}
              {activeTab === "scoring" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">2. The Dual Scoring Engine</h3>
                    <p className="text-slate-400">How our models calculate potential vs. danger.</p>
                  </div>

                  {/* Visual Comparison: Bullish vs Bearish */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3 font-mono">
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">🟢 HIGH ALPHA GEM</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px]">
                          Alpha: 94
                        </span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        <li>• Volume 3.8x above 24h average</li>
                        <li>• 5 Smart Wallets accumulating</li>
                        <li>• 100% LP Burned 🔥</li>
                        <li>• Top 10 hold &lt;18% of supply</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-bold">🔴 HIGH RISK RUG DANGER</span>
                        <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 text-[10px]">
                          Risk: 88
                        </span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        <li>• Unlocked LP (can be pulled anytime)</li>
                        <li>• Top 10 control 65% of supply</li>
                        <li>• Deployer holding 15% and selling</li>
                        <li>• Wash-trading bot volume</li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm">Key Scoring Metrics Table:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-[#1E2230]">
                      <thead className="bg-[#0B0C10] text-slate-400 font-mono">
                        <tr>
                          <th className="p-2 border-b border-[#1E2230]">Signal</th>
                          <th className="p-2 border-b border-[#1E2230]">Bullish Indicator</th>
                          <th className="p-2 border-b border-[#1E2230]">Red Flag Warning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2230] font-mono">
                        <tr>
                          <td className="p-2 font-bold text-white">Buyer/Seller Ratio</td>
                          <td className="p-2 text-emerald-400">&gt; 3.0 : 1 (Organic demand)</td>
                          <td className="p-2 text-red-400">&lt; 0.8 : 1 (Heavy dumping)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-white">Holder Concentration</td>
                          <td className="p-2 text-emerald-400">Top 10 hold &lt; 25%</td>
                          <td className="p-2 text-red-400">
                            Top 10 hold &gt; 45% (Whale dump risk)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-white">LP Security</td>
                          <td className="p-2 text-emerald-400">Burned to Dead Address</td>
                          <td className="p-2 text-red-400">Unlocked / No time-lock</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CHAPTER 3: RADAR & FILTERS */}
              {activeTab === "radar" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">3. The Alpha Radar & Filters</h3>
                    <p className="text-slate-400">Mastering the main discovery terminal.</p>
                  </div>

                  <p>Segment market activity using the presets above the main table:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-3 rounded-lg bg-[#0B0C10] border border-[#1E2230]">
                      <span className="text-[#7053F5] font-bold">🔥 High Momentum:</span> Tokens with
                      Alpha Scores &gt;75 and volume expanding faster than 2x baseline.
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0C10] border border-[#1E2230]">
                      <span className="text-blue-400 font-bold">🐋 Whale Inflows:</span> Tokens with
                      single swaps &gt;$5,000 in the last 60 minutes.
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0C10] border border-[#1E2230]">
                      <span className="text-purple-400 font-bold">🎯 Smart Snipes:</span> Active buys
                      from tagged high-win-rate wallets.
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0C10] border border-[#1E2230]">
                      <span className="text-emerald-400 font-bold">🛡️ Low Risk (&lt;30):</span> Hides
                      tokens with high concentration or unlocked LP.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0C10]/60 border border-[#1E2230] flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-[#12141C] border border-[#1E2230] font-mono text-[10px] text-slate-300">
                      Shortcut
                    </span>
                    <span>
                      Click any row to open the <strong>Slide-Over Intelligence Drawer</strong> without
                      losing table position.
                    </span>
                  </div>
                </div>
              )}

              {/* CHAPTER 4: SMART MONEY */}
              {activeTab === "smart-money" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">4. Smart Money & Whale Profiling</h3>
                    <p className="text-slate-400">
                      How Monad Alpha identifies and tags profitable traders.
                    </p>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#0B0C10] border border-[#1E2230] flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-purple-900/60 text-[#7053F5] font-bold">
                        🎯 Sniper
                      </span>
                      <span className="text-slate-300">
                        Buys in first 3 blocks of new pool launch and exits profitably.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0B0C10] border border-[#1E2230] flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 font-bold">
                        🧠 Smart Trader
                      </span>
                      <span className="text-slate-300">
                        Audited historical win rate &gt;65% across 15+ distinct trades.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0B0C10] border border-[#1E2230] flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-400 font-bold">
                        🐋 Whale
                      </span>
                      <span className="text-slate-300">
                        Possesses high $MON balance; individual swaps move liquidity pools.
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 pt-2">
                    Check <strong>/smart-money</strong> to view the full leaderboard ranked by 30-day
                    realized PnL.
                  </p>
                </div>
              )}

              {/* CHAPTER 5: GEMINI AI */}
              {activeTab === "gemini-ai" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">5. Gemini Flash AI Intelligence</h3>
                    <p className="text-slate-400">
                      The on-chain analyst that turns raw numbers into English.
                    </p>
                  </div>

                  {/* Visual Mock: AI Card */}
                  <div className="p-4 rounded-xl bg-[#0B0C10] border border-[#7053F5]/50 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-[#7053F5]" /> AI DOSSIER: $CHOG
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#7053F5] text-white font-bold">
                        GEMINI 2.0 FLASH
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#7053F5]/10 border border-[#7053F5]/20 text-slate-200 text-xs">
                      &quot;Breakout velocity driven by 4 smart wallets accumulating +45k MON.
                      Buyer/seller ratio is 6.8:1 with zero deployer sell pressure.&quot;
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded bg-[#12141C] border border-[#1E2230] text-emerald-400">
                        ✔ 100% Burned LP
                      </div>
                      <div className="p-2 rounded bg-[#12141C] border border-[#1E2230] text-emerald-400">
                        ✔ Top 10 hold only 14.2%
                      </div>
                    </div>
                  </div>

                  <p>
                    Powered by <strong>Gemini 2.0 Flash</strong>, opening any token reveals instant
                    catalysts, buyer-to-seller dynamics, and safety audits without manual block
                    explorer checks.
                  </p>
                </div>
              )}

              {/* CHAPTER 6: METAMASK & FAUCET */}
              {activeTab === "metamask" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      6. MetaMask Setup & Testnet Faucet
                    </h3>
                    <p className="text-slate-400">
                      Connecting your real wallet and claiming testnet $MON.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs">
                    ⚡ <strong>Automated Setup:</strong> You do NOT need to manually configure RPC URLs!
                  </div>

                  <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                    <li>
                      Click <strong>&quot;Connect Wallet&quot;</strong> in the top-right corner.
                    </li>
                    <li>
                      Approve the MetaMask request. If you are on Ethereum, MetaMask automatically
                      prompts to add and switch to <strong>Monad Testnet</strong> (Chain ID:{" "}
                      <code>10143</code>).
                    </li>
                    <li>
                      Once connected, your live `$MON` balance and address are displayed in the header.
                    </li>
                  </ol>

                  <div className="pt-3 border-t border-[#1E2230]">
                    <h4 className="font-bold text-white text-xs mb-2">Claim Free Testnet $MON:</h4>
                    <a
                      href="https://faucet.monad.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7053F5] hover:bg-[#6C52EE] text-white font-semibold text-xs transition cursor-pointer"
                    >
                      <span>Open Official Monad Faucet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-[#1E2230] bg-[#0B0C10]/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-[#12141C] border border-[#1E2230] text-[9px]">
                Esc
              </kbd>{" "}
              to close
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#7053F5] hover:underline font-semibold cursor-pointer"
            >
              Close Handbook ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHandbook;
