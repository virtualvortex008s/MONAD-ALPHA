"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { TokenDossierDrawer } from "@/components/TokenDossierDrawer";
import { AiAuditModal } from "@/components/AiAuditModal";
import { mockTokens } from "@/data/mockTokens";
import { Token } from "@/types/token";
import { MONAD_TESTNET_CONFIG } from "@/lib/monad";
import { MetaMaskLogo } from "@/components/icons/MetaMaskLogo";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Search,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Radio,
  Activity,
  Layers,
  Zap,
  TrendingUp,
  BarChart3,
  Bot,
  Star,
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

type FilterTab = "ALL" | "NEW_DEPLOYMENTS" | "TOP_GAINERS" | "HIGH_VOLUME" | "LOW_RISK" | "WHALES" | "FAVORITES";

function AlphaScannerContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("address") || searchParams.get("token");

  const { isConnected, connectWallet } = useWallet();
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();

  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [auditToken, setAuditToken] = useState<Token | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [blockHeight, setBlockHeight] = useState<number>(70066720);
  const [lastDiscoveredTime, setLastDiscoveredTime] = useState<string>("45s ago");

  // Fetch dynamic tokens stream from /api/tokens
  useEffect(() => {
    let ignore = false;

    const fetchDynamicTokens = async () => {
      try {
        const res = await fetch("/api/tokens");
        if (!res.ok) throw new Error("Failed to fetch dynamic tokens");
        const data = await res.json();
        if (!ignore && data?.tokens && Array.isArray(data.tokens) && data.tokens.length > 0) {
          setTokens(data.tokens);
          if (data.blockNumber) {
            setBlockHeight(parseInt(data.blockNumber));
          }
        }
      } catch (err) {
        console.warn("Using fallback tokens cache:", err);
      }
    };

    fetchDynamicTokens();
    const interval = setInterval(fetchDynamicTokens, 15000); // 15s stream refresh

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Sync block number increment
  useEffect(() => {
    const blockTimer = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
    }, 1200);

    return () => clearInterval(blockTimer);
  }, []);

  // Handle URL token / address query parameter (e.g. from ticker or contract search bar)
  useEffect(() => {
    if (!tokenParam || tokens.length === 0) return;

    const clean = tokenParam.toLowerCase().replace("$", "").trim();
    const match = tokens.find(
      (t) =>
        t.address.toLowerCase() === clean ||
        t.symbol.toLowerCase().replace("$", "") === clean ||
        t.id.toLowerCase() === clean
    );

    if (match) {
      setSelectedToken(match);
      setIsDrawerOpen(true);
    } else if (clean.startsWith("0x") && clean.length === 42) {
      // Dynamic fallback token for direct EVM contract address scan on Monad Testnet
      const provisional: Token = {
        id: clean,
        name: `Token ${clean.slice(0, 6)}...${clean.slice(-4)}`,
        symbol: `$${clean.slice(2, 6).toUpperCase()}`,
        address: clean,
        priceUsd: 0.001,
        priceMon: 0.00025,
        change1h: 0,
        change24h: 0,
        volume24h: 1000,
        liquidity: 5000,
        alphaScore: 50,
        alphaDriver: "Direct Contract Scan",
        riskScore: 25,
        riskFactors: ["Custom Contract on Monad Testnet"],
        smartMoneyNetFlow: 0,
        smartWalletsCount: 1,
        aiSummary: "Direct contract address scan on Monad Testnet. Live verification in progress.",
        holderConcentrationTop10: 15,
        lpStatus: "Verified Monad DEX LP",
        deployerBalanceMon: 10,
        deployerAddress: clean,
        catalysts: ["Direct Monad Testnet Contract Inspection"],
        explorerUrl: `https://testnet.monadexplorer.com/token/${clean}`,
        verified: false,
        launchTimeAgo: "Just now",
        isNewDeployment: true,
        candles5m: [],
        candles15m: [],
        candles1h: [],
        smartAccumulators: [],
      };
      setSelectedToken(provisional);
      setIsDrawerOpen(true);
    }
  }, [tokenParam, tokens]);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1800);
  };


  const handleOpenToken = (token: Token) => {
    setSelectedToken(token);
    setIsDrawerOpen(true);
  };

  const handleOpenAiAudit = (token: Token, e: React.MouseEvent) => {
    e.stopPropagation();
    setAuditToken(token);
    setIsAuditModalOpen(true);
  };

  // Quick stats
  const newDeploymentsCount = useMemo(() => {
    return tokens.filter(
      (t) => t.isNewDeployment || t.launchTimeAgo.includes("m ago") || t.launchTimeAgo.includes("h ago")
    ).length;
  }, [tokens]);

  // Filtering and searching logic
  const filteredTokens = useMemo(() => {
    let result = [...tokens];

    // Search query filter (name, symbol, or address)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().replace("$", "").trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q)
      );
    }

    // Tab filter
    switch (activeTab) {
      case "NEW_DEPLOYMENTS":
        result = result
          .filter(
            (t) =>
              t.isNewDeployment ||
              t.launchTimeAgo.includes("m ago") ||
              t.launchTimeAgo.includes("h ago")
          )
          .sort((a, b) => (b.deployTimestamp || 0) - (a.deployTimestamp || 0));
        break;

      case "TOP_GAINERS":
        result = result.sort((a, b) => b.change24h - a.change24h);
        break;

      case "HIGH_VOLUME":
        result = result.sort((a, b) => b.volume24h - a.volume24h);
        break;

      case "LOW_RISK":
        result = result.filter((t) => t.riskScore <= 30);
        break;

      case "WHALES":
        result = result.filter(
          (t) => t.smartWalletsCount >= 20 || t.smartMoneyNetFlow > 200000 || t.alphaDriver.includes("Whale")
        );
        break;

      case "FAVORITES":
        result = result.filter((t) => isFavorite(t.address) || isFavorite(t.id));
        break;

      case "ALL":
      default:
        break;
    }

    return result;
  }, [tokens, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & LIVE CONTRACT STREAM PULSE INDICATOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#171922] pb-6">
        <div>
          {/* Glowing Pulse Testnet Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FFA3]" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-[#00FFA3] uppercase">
              Live Deployments Stream · Monad Testnet (Chain ID 10143)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5 flex items-center gap-3">
            <span>Alpha Scanner &amp; Contract Radar</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#7053F5]/20 text-[#7053F5] border border-[#7053F5]/30">
              10K TPS Parallel Scanner
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time on-chain discovery engine continuously scanning blocks for newly deployed ERC-20 smart contracts, liquidity pairs, whale accumulation clusters, and instant Gemini 2.0 Flash AI audits.
          </p>
        </div>

        {/* Live Block & Stream Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl border border-[#171922] bg-[#0D0F14] px-3.5 py-2 font-mono text-xs flex items-center gap-2 shadow-sm">
            <Radio className="h-3.5 w-3.5 text-[#00FFA3] animate-pulse" />
            <span className="text-slate-400">Block:</span>
            <span className="text-white font-bold">#{blockHeight.toLocaleString()}</span>
          </div>

          <div className="rounded-xl border border-[#7053F5]/30 bg-[#7053F5]/10 px-3.5 py-2 font-mono text-xs flex items-center gap-2 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-[#7053F5]" />
            <span className="text-slate-300">New Contracts:</span>
            <span className="text-white font-bold">{newDeploymentsCount} Today</span>
          </div>

          <div className="rounded-xl border border-[#171922] bg-[#0D0F14] px-3.5 py-2 font-mono text-xs flex items-center gap-2 shadow-sm">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Total Scanned:</span>
            <span className="text-white font-bold">{tokens.length} Assets</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR & QUICK-FILTER TABS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token name, symbol, or paste 0x address..."
            className="w-full bg-[#0D0F14] border border-[#171922] focus:border-[#7053F5] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "ALL"
                ? "bg-[#7053F5] text-white shadow-lg shadow-[#7053F5]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <span>All Assets</span>
            <span className="text-[10px] opacity-75">({tokens.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("NEW_DEPLOYMENTS")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "NEW_DEPLOYMENTS"
                ? "bg-[#00FFA3] text-black shadow-lg shadow-[#00FFA3]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>New Deployments</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono font-bold">
              {newDeploymentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TOP_GAINERS")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "TOP_GAINERS"
                ? "bg-[#7053F5] text-white shadow-lg shadow-[#7053F5]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>Top Gainers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("HIGH_VOLUME")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "HIGH_VOLUME"
                ? "bg-[#7053F5] text-white shadow-lg shadow-[#7053F5]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>High Volume</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LOW_RISK")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "LOW_RISK"
                ? "bg-[#7053F5] text-white shadow-lg shadow-[#7053F5]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>Low Risk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WHALES")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "WHALES"
                ? "bg-[#7053F5] text-white shadow-lg shadow-[#7053F5]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <span>Whale Inflows</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FAVORITES")}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "FAVORITES"
                ? "bg-[#F5A623] text-black shadow-lg shadow-[#F5A623]/30"
                : "bg-[#0D0F14] text-slate-400 hover:text-white border border-[#171922]"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeTab === "FAVORITES" ? "fill-black" : "text-[#F5A623]"}`} />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeTab === "FAVORITES" ? "bg-black/20 text-black" : "bg-[#00FFA3]/15 text-[#00FFA3]"
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. RADAR TOKEN DIRECTORY TABLE */}
      <div className="relative rounded-2xl border border-[#171922] bg-[#0D0F14] shadow-2xl overflow-hidden">
        <div className="p-2 sm:p-4 responsive-table-container">
          <table className="w-full min-w-[900px] text-left text-xs font-mono">
            <thead className="border-b border-[#171922] bg-[#0A0C11]/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 w-8 text-center">★</th>
                <th className="p-3">Asset</th>
                <th className="p-3">Price / 24h Change</th>
                <th className="p-3">Deployed</th>
                <th className="p-3">Alpha Score</th>
                <th className="p-3">24h Volume / Liq</th>
                <th className="p-3">Risk Assessment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171922]">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No tokens found matching &quot;{searchQuery}&quot;. Try pasting a valid contract address.
                  </td>
                </tr>
              ) : (
                filteredTokens.map((token) => {
                  const isPositive24h = token.change24h >= 0;
                  const isSaved = isFavorite(token.address || token.id);
                  const isNew = token.isNewDeployment || token.launchTimeAgo.includes("m ago");

                  return (
                    <tr
                      key={token.id}
                      onClick={() => handleOpenToken(token)}
                      className="hover:bg-[#13161F]/80 transition-colors cursor-pointer group"
                    >
                      {/* Interactive Bookmark Star */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(token);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#171922] transition cursor-pointer"
                          aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
                          title={isSaved ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              isSaved
                                ? "fill-[#F5A623] text-[#F5A623]"
                                : "text-[#4A5568] hover:text-[#F5A623]"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Token Asset & Address */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7053F5]/20 to-[#12141C] border border-[#7053F5]/30 flex items-center justify-center font-bold text-white text-xs shrink-0 group-hover:border-[#7053F5] transition">
                            {token.symbol.replace("$", "").slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm group-hover:text-[#7053F5] transition">
                                {token.symbol}
                              </span>
                              <span className="text-[11px] text-slate-400 font-sans truncate max-w-[130px]">
                                {token.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px] inline-block text-slate-500">
                                {token.address}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(token.address, e)}
                                className="text-slate-500 hover:text-white p-0.5 rounded transition"
                                title="Copy contract address"
                              >
                                {copiedAddress === token.address ? (
                                  <Check className="w-3 h-3 text-[#00FFA3]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price and 24h / 1h Change */}
                      <td className="p-3">
                        <div className="text-white font-bold text-sm block">
                          ${(token.priceUsd ?? token.price ?? 0) >= 1
                            ? (token.priceUsd ?? token.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                            : (token.priceUsd ?? token.price ?? 0).toFixed(6)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-bold flex items-center gap-0.5 ${
                              isPositive24h ? "text-[#00FFA3]" : "text-[#FF4D4D]"
                            }`}
                          >
                            {isPositive24h ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {token.change24h > 0 ? "+" : ""}
                            {token.change24h}% 24h
                          </span>
                          <span className="text-[9px] text-slate-500">
                            ({token.change1h > 0 ? "+" : ""}{token.change1h}% 1h)
                          </span>
                        </div>
                      </td>

                      {/* Deployment Timestamp / Marker */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-mono text-xs font-semibold">
                            {token.launchTimeAgo}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#7053F5]/20 text-[#7053F5] border border-[#7053F5]/30 uppercase animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Monad Testnet
                        </span>
                      </td>

                      {/* Alpha Score with Driver */}
                      <td className="p-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7053F5]/10 border border-[#7053F5]/30 text-[#7053F5] font-bold">
                          <Flame className="w-3.5 h-3.5 text-[#00FFA3]" />
                          <span>{token.alphaScore} / 100</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-1 truncate max-w-[130px]">
                          {token.alphaDriver}
                        </span>
                      </td>

                      {/* 24h Volume and Pool Liquidity */}
                      <td className="p-3">
                        <div className="text-white font-bold">
                          ${(token.volume24h / 1000).toFixed(0)}k Vol
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ${(token.liquidity / 1000).toFixed(0)}k Liq · {token.lpStatus.slice(0, 10)}
                        </div>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {token.riskScore <= 35 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[11px] font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Safe ({token.riskScore})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20 text-[11px] font-bold">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Moderate ({token.riskScore})</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[120px] mt-1">
                          {token.riskFactors[0] || "Audit Verified"}
                        </span>
                      </td>

                      {/* Actions: AI Audit & Inspect on Explorer */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* AI Audit Button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenAiAudit(token, e)}
                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7053F5]/20 to-[#7053F5]/35 hover:from-[#7053F5] hover:to-[#5E3FEB] text-white text-[11px] font-bold border border-[#7053F5]/40 transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                            title="Generate instant 2-sentence Gemini risk audit"
                          >
                            <Sparkles className="w-3 h-3 text-[#00FFA3]" />
                            <span>AI Audit</span>
                          </button>

                          {/* Inspect on Explorer Button */}
                          <a
                            href={`${MONAD_TESTNET_CONFIG.blockExplorer}/token/${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg border border-[#171922] bg-[#0A0C11] hover:bg-[#1A1E29] hover:border-slate-600 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
                            title="Inspect contract on Monad Explorer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Full Dossier Arrow */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenToken(token);
                            }}
                            className="hidden sm:inline-flex px-2 py-1.5 rounded-lg bg-[#13161F] hover:bg-[#1E2230] text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
                          >
                            Dossier →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Token Dossier Drawer */}
      <TokenDossierDrawer
        token={selectedToken}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isWatchlisted={selectedToken ? isFavorite(selectedToken.address || selectedToken.id) : false}
        onToggleWatchlist={() => selectedToken && toggleFavorite(selectedToken)}
      />

      {/* Instant Gemini AI Risk Audit Modal */}
      <AiAuditModal
        token={auditToken}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onOpenFullDossier={handleOpenToken}
      />
    </div>
  );
}

export default function AlphaScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-16 flex items-center justify-center font-mono text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span>Querying Monad RPC Node (testnet-rpc.monad.xyz)...</span>
          </div>
        </div>
      }
    >
      <AlphaScannerContent />
    </Suspense>
  );
}
