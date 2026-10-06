"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { AlphaRadarTable } from "@/components/AlphaRadarTable";
import { TokenDossierDrawer } from "@/components/TokenDossierDrawer";
import { SmartMoneyFeed } from "@/components/SmartMoneyFeed";
import { LiveBlockStream } from "@/components/LiveBlockStream";
import { ScoreGauge } from "@/components/ScoreGauge";
import { mockTokens, mockTrades, mockEcosystemStats } from "@/data/mockTokens";
import { Token, FilterCategory } from "@/types/token";
import { MonadLogo } from "@/components/MonadLogo";
import {
  Star,
  Boxes,
  Activity,
  Terminal,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Radio,
  Layers,
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialWatchlistOnly = searchParams.get("watchlist") === "true";

  const [tokens] = useState<Token[]>(mockTokens);
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>("ALL");
  const [selectedToken, setSelectedToken] = useState<Token | null>(mockTokens[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(["chog", "monx", "spire"]);
  const [showWatchlistOnly, setShowWatchlistOnly] = useState<boolean>(initialWatchlistOnly);
  const [activeStreamTab, setActiveStreamTab] = useState<"BLOCKS" | "SMART_MONEY">("BLOCKS");
  const [blockHeight, setBlockHeight] = useState<number>(61449520);

  // Live terminal logs stream state
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: number; text: string; time: string; type: "buy" | "spike" | "whale" | "sync" }>>([
    { id: 1, text: "▲ 0x44...F3B bought 1.76M MONX ($148K)", time: "14:24:02", type: "buy" },
    { id: 2, text: "⚡ Volume spike detected on FLUX (+380%)", time: "14:24:18", type: "spike" },
    { id: 3, text: "▲ 0x91...72A bought 2,180,000 MONX ($184K)", time: "14:24:35", type: "buy" },
    { id: 4, text: "Whale 0x82...19F accumulated $212K ECHO", time: "14:24:51", type: "whale" },
    { id: 5, text: "✔ Consensus block #61449528 finalized in 588ms", time: "14:25:01", type: "sync" },
  ]);

  // Sync real Monad Testnet block height from RPC and increment
  useEffect(() => {
    let ignore = false;
    fetch("/api/blocks/live")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data?.block?.number) {
          setBlockHeight(parseInt(data.block.number));
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 1000);

    // Periodically append simulated terminal logs
    const logInterval = setInterval(() => {
      const sampleEvents = [
        { text: "▲ 0x6e...B49 swapped 4,500 MON for 980K SPIRE", type: "buy" as const },
        { text: "⚡ Sniper cluster detected in mempool: 4 wallets", type: "spike" as const },
        { text: "▲ 0x11...92A accumulated 64,000 FLUX ($181K)", type: "whale" as const },
        { text: "✔ Direct RPC Monad testnet slot processed (8,410 txs)", type: "sync" as const },
      ];
      const nextEv = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      setTerminalLogs((prev) => [
        { id: Date.now(), text: nextEv.text, time: timeStr, type: nextEv.type },
        ...prev.slice(0, 14),
      ]);
    }, 4500);

    return () => {
      ignore = true;
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, []);

  const handleToggleWatchlist = (tokenId: string) => {
    setWatchlist((prev) =>
      prev.includes(tokenId) ? prev.filter((id) => id !== tokenId) : [...prev, tokenId]
    );
  };

  const handleSelectToken = (token: Token) => {
    setSelectedToken(token);
    setIsDrawerOpen(true);
  };

  const handleSelectTokenBySymbol = (symbol: string) => {
    const found = tokens.find(
      (t) => t.symbol.toLowerCase() === symbol.toLowerCase() || t.id.toLowerCase() === symbol.toLowerCase()
    );
    if (found) {
      setSelectedToken(found);
      setIsDrawerOpen(true);
    }
  };

  // Filter tokens based on category and watchlist
  const filteredTokens = useMemo(() => {
    let result = [...tokens];

    if (showWatchlistOnly) {
      result = result.filter((t) => watchlist.includes(t.id));
    }

    switch (currentFilter) {
      case "MOMENTUM":
        result = result.filter((t) => t.change1h > 15 || t.alphaScore >= 80);
        break;
      case "WHALES":
        result = result.filter(
          (t) => t.alphaDriver.includes("Whale") || t.smartMoneyNetFlow > 300000
        );
        break;
      case "SNIPERS":
        result = result.filter(
          (t) => t.alphaDriver.includes("Sniper") || t.smartWalletsCount > 40
        );
        break;
      case "LOW_RISK":
        result = result.filter((t) => t.riskScore <= 30);
        break;
      case "NEW_LAUNCHES":
        result = result.filter(
          (t) => t.launchTimeAgo.includes("h ago") && parseInt(t.launchTimeAgo) <= 6
        );
        break;
      case "ALL":
      default:
        break;
    }

    return result;
  }, [tokens, currentFilter, showWatchlistOnly, watchlist]);

  // Specific 4 trending tokens from Figma design
  const trendingTokens = useMemo(() => {
    const symbols = ["$MONX", "$ECHO", "$FLUX", "$SPIRE"];
    return symbols.map((sym) => {
      const match = tokens.find((t) => t.symbol.toUpperCase() === sym.toUpperCase());
      return match || tokens[0];
    });
  }, [tokens]);

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 LARGE METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Network TPS */}
        <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-5 hover:border-[#7053F5]/40 transition shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              NETWORK TPS
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              9,374
            </span>
            <span className="text-[11px] font-mono text-[#00FFA3] font-bold">
              PEAK 10K
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Block #{blockHeight.toLocaleString()}</span>
            <span className="font-mono text-slate-500">588ms finality</span>
          </div>
        </div>

        {/* Card 2: Active Wallets */}
        <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-5 hover:border-[#7053F5]/40 transition shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              ACTIVE WALLETS
            </span>
            <span className="text-[10px] font-mono text-[#7053F5] font-bold">24H</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              142,830
            </span>
            <span className="text-[11px] font-mono text-[#00FFA3] font-bold">
              +12.4%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Unique addresses</span>
            <span className="font-mono text-slate-500">1,482 Whales</span>
          </div>
        </div>

        {/* Card 3: 24H Volume */}
        <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-5 hover:border-[#7053F5]/40 transition shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              24H VOLUME
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">DEXES</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              $284M
            </span>
            <span className="text-[11px] font-mono text-[#00FFA3] font-bold">
              +34.8%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Monad ecosystem</span>
            <span className="font-mono text-slate-500">1.8M MON</span>
          </div>
        </div>

        {/* Card 4: New Tokens */}
        <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-5 hover:border-[#7053F5]/40 transition shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              NEW TOKENS
            </span>
            <span className="rounded bg-[#F59E0B]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#F59E0B] border border-[#F59E0B]/30">
              TODAY
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              38
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              Deployed
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verified bytecode</span>
            <span className="font-mono text-[#00FFA3]">82% Safe</span>
          </div>
        </div>
      </div>

      {/* 2. SPLIT TWO-COLUMN LIVE ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Alpha Signals ● Live */}
        <div className="lg:col-span-6 rounded-xl border border-[#171922] bg-[#0D0F14] p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#171922] mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#7053F5]" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Live Alpha Signals
              </h2>
              <span className="flex items-center gap-1 font-mono text-[10px] text-[#00FFA3] ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-ping" />
                Live
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Real-time Inflow Scanner</span>
          </div>

          {/* Rows of Live Signals */}
          <div className="space-y-3 flex-1">
            {/* Signal 1: 88 Green - SMART MONEY $MONX */}
            <div
              onClick={() => handleSelectTokenBySymbol("MONX")}
              className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-[#171922] bg-[#060709] hover:bg-[#13161F] hover:border-[#7053F5]/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ScoreGauge score={88} size={42} strokeWidth={3.5} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#7053F5] border border-[#7053F5]/30">
                      SMART MONEY
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-[#7053F5] transition-colors">
                      $MONX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    5 wallets accumulated 2.4% of supply in 18 min · <span className="font-mono text-slate-500">2m ago</span>
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-[#7053F5] transition shrink-0" />
            </div>

            {/* Signal 2: 91 Green - WHALE ALERT $ECHO */}
            <div
              onClick={() => handleSelectTokenBySymbol("ECHO")}
              className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-[#171922] bg-[#060709] hover:bg-[#13161F] hover:border-[#7053F5]/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ScoreGauge score={91} size={42} strokeWidth={3.5} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#00FFA3]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#00FFA3] border border-[#00FFA3]/30">
                      WHALE ALERT
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-[#00FFA3] transition-colors">
                      $ECHO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    0x82...19F purchased $212K in a single transaction · <span className="font-mono text-slate-500">7m ago</span>
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-[#00FFA3] transition shrink-0" />
            </div>

            {/* Signal 3: 81 Amber - VOLUME SPIKE $FLUX */}
            <div
              onClick={() => handleSelectTokenBySymbol("FLUX")}
              className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-[#171922] bg-[#060709] hover:bg-[#13161F] hover:border-[#F59E0B]/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ScoreGauge score={81} size={42} strokeWidth={3.5} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#F59E0B]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#F59E0B] border border-[#F59E0B]/30">
                      VOLUME SPIKE
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                      $FLUX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Volume increased 380% vs 7-day rolling baseline · <span className="font-mono text-slate-500">14m ago</span>
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-[#F59E0B] transition shrink-0" />
            </div>

            {/* Signal 4: 83 Amber - ACCUMULATION $SPIRE */}
            <div
              onClick={() => handleSelectTokenBySymbol("SPIRE")}
              className="flex items-center justify-between gap-3.5 p-3 rounded-lg border border-[#171922] bg-[#060709] hover:bg-[#13161F] hover:border-[#F59E0B]/50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ScoreGauge score={83} size={42} strokeWidth={3.5} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#7053F5] border border-[#7053F5]/30">
                      ACCUMULATION
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-[#7053F5] transition-colors">
                      $SPIRE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    8 wallets entered systematically over 2 hours · <span className="font-mono text-slate-500">28m ago</span>
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-[#7053F5] transition shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Live Blockchain Activity ● (Terminal Window) */}
        <div className="lg:col-span-6 rounded-xl border border-[#171922] bg-[#0A0C11] p-5 shadow-xl flex flex-col font-mono">
          {/* Terminal Window Header with dots */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#171922] mb-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] text-slate-400 ml-1">
                monad-alpha · activity-stream
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#00FFA3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-ping" />
              <span>live</span>
            </div>
          </div>

          {/* Scrolling on-chain swap stream */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[290px] pr-1">
            {terminalLogs.map((log) => {
              let tagColor = "text-[#00FFA3]";
              if (log.type === "spike") tagColor = "text-[#F59E0B]";
              if (log.type === "whale") tagColor = "text-[#7053F5]";
              if (log.type === "sync") tagColor = "text-slate-500";

              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-2 p-2 rounded bg-[#0D0F14]/80 border border-[#171922]/60 text-xs hover:border-[#171922] transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`${tagColor} font-bold shrink-0`}>
                      {log.type === "buy" && "▲"}
                      {log.type === "spike" && "⚡"}
                      {log.type === "whale" && "◆"}
                      {log.type === "sync" && "✓"}
                    </span>
                    <span className="text-slate-300 truncate text-[11px]">
                      {log.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">
                    {log.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#171922] flex items-center justify-between text-[10px] text-slate-500">
            <span>Sub-second slot ingestion active</span>
            <span className="text-[#7053F5]">10143:monad-testnet</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: TRENDING TOKENS (Ranked by Alpha Score) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#7053F5]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Trending Tokens <span className="text-slate-500 font-normal text-xs">(Ranked by Alpha Score)</span>
            </h2>
          </div>
          <span className="text-xs font-mono text-[#7053F5]">4 Featured Signals</span>
        </div>

        {/* Horizontal Grid of 4 Token Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: $MONX (MonadFi) */}
          <div
            onClick={() => handleSelectTokenBySymbol("MONX")}
            className="rounded-xl border border-[#171922] bg-[#0D0F14] p-4 hover:border-[#7053F5]/60 hover:bg-[#13161F] transition cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7053F5]/20 text-[#7053F5] font-bold text-xs border border-[#7053F5]/40 group-hover:scale-105 transition-transform">
                  MX
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#7053F5] transition-colors">
                    $MONX
                  </h3>
                  <span className="text-[11px] text-slate-400">MonadFi</span>
                </div>
              </div>
              <ScoreGauge score={88} size={44} strokeWidth={3.5} />
            </div>

            <div className="mt-3 pt-3 border-t border-[#171922] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white font-mono">$0.0842</span>
                <span className="text-[10px] font-mono text-[#00FFA3] font-bold ml-1.5">+18.4%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Vol $1.4M</span>
            </div>
          </div>

          {/* Card 2: $ECHO (EchoNet) */}
          <div
            onClick={() => handleSelectTokenBySymbol("ECHO")}
            className="rounded-xl border border-[#171922] bg-[#0D0F14] p-4 hover:border-[#00FFA3]/60 hover:bg-[#13161F] transition cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00FFA3]/20 text-[#00FFA3] font-bold text-xs border border-[#00FFA3]/40 group-hover:scale-105 transition-transform">
                  EC
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#00FFA3] transition-colors">
                    $ECHO
                  </h3>
                  <span className="text-[11px] text-slate-400">EchoNet</span>
                </div>
              </div>
              <ScoreGauge score={91} size={44} strokeWidth={3.5} />
            </div>

            <div className="mt-3 pt-3 border-t border-[#171922] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white font-mono">$0.00170</span>
                <span className="text-[10px] font-mono text-[#00FFA3] font-bold ml-1.5">+33.2%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Vol $820K</span>
            </div>
          </div>

          {/* Card 3: $FLUX (FluxDAO) */}
          <div
            onClick={() => handleSelectTokenBySymbol("FLUX")}
            className="rounded-xl border border-[#171922] bg-[#0D0F14] p-4 hover:border-[#F59E0B]/60 hover:bg-[#13161F] transition cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-xs border border-[#F59E0B]/40 group-hover:scale-105 transition-transform">
                  FX
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#F59E0B] transition-colors">
                    $FLUX
                  </h3>
                  <span className="text-[11px] text-slate-400">FluxDAO</span>
                </div>
              </div>
              <ScoreGauge score={81} size={44} strokeWidth={3.5} />
            </div>

            <div className="mt-3 pt-3 border-t border-[#171922] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white font-mono">$2.84</span>
                <span className="text-[10px] font-mono text-[#00FFA3] font-bold ml-1.5">+11.7%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Vol $3.1M</span>
            </div>
          </div>

          {/* Card 4: $SPIRE (SpireVault) */}
          <div
            onClick={() => handleSelectTokenBySymbol("SPIRE")}
            className="rounded-xl border border-[#171922] bg-[#0D0F14] p-4 hover:border-[#F59E0B]/60 hover:bg-[#13161F] transition cursor-pointer shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7053F5]/20 text-[#7053F5] font-bold text-xs border border-[#7053F5]/40 group-hover:scale-105 transition-transform">
                  SP
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#7053F5] transition-colors">
                    $SPIRE
                  </h3>
                  <span className="text-[11px] text-slate-400">SpireVault</span>
                </div>
              </div>
              <ScoreGauge score={83} size={44} strokeWidth={3.5} />
            </div>

            <div className="mt-3 pt-3 border-t border-[#171922] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white font-mono">$0.741</span>
                <span className="text-[10px] font-mono text-[#00FFA3] font-bold ml-1.5">+9.1%</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Vol $640K</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INSTITUTIONAL ALPHA RADAR TABLE & STREAM */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <FilterBar
              currentCategory={currentFilter}
              onSelectCategory={(cat) => setCurrentFilter(cat)}
              tokensCount={filteredTokens.length}
            />
          </div>

          {/* Quick Watchlist filter pill */}
          <button
            type="button"
            onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all shrink-0 ${
              showWatchlistOnly
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "border-[#171922] bg-[#0D0F14] text-slate-300 hover:border-slate-600 hover:text-white"
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                showWatchlistOnly ? "fill-amber-400 text-amber-400" : "text-slate-400"
              }`}
            />
            <span>Watchlist Only</span>
            {watchlist.length > 0 && (
              <span className="rounded-full bg-[#7053F5]/30 px-1.5 py-0.2 font-mono text-[10px] text-purple-200">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>

        {/* Main Radar Table */}
        <AlphaRadarTable
          tokens={filteredTokens}
          selectedTokenId={selectedToken?.id || null}
          onSelectToken={handleSelectToken}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />

        {/* Live On-Chain Stream Section */}
        <div id="tx-intel" className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-[#171922] bg-[#0D0F14] p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveStreamTab("BLOCKS")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-bold transition-all ${
                  activeStreamTab === "BLOCKS"
                    ? "bg-[#7053F5] text-white shadow-[0_0_12px_rgba(112, 83, 245,0.35)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>Live Monad Block Stream</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-ping" />
              </button>

              <button
                type="button"
                onClick={() => setActiveStreamTab("SMART_MONEY")}
                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 font-bold transition-all ${
                  activeStreamTab === "SMART_MONEY"
                    ? "bg-[#7053F5] text-white shadow-[0_0_12px_rgba(112, 83, 245,0.35)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Smart Money Live Flow</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Direct RPC:</span>
              <span className="text-slate-300">testnet-rpc.monad.xyz</span>
              <span>•</span>
              <span className="text-[#7053F5]">10143</span>
            </div>
          </div>

          {activeStreamTab === "BLOCKS" ? (
            <LiveBlockStream />
          ) : (
            <SmartMoneyFeed
              initialTrades={mockTrades.slice(0, 5)}
              tokens={tokens}
              onSelectTokenSymbol={handleSelectTokenBySymbol}
            />
          )}
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

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-slate-500">Loading Monad Alpha Radar...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
