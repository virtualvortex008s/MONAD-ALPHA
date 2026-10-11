"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Token } from "@/types/token";
import { ArrowUpRight, ArrowDownRight, Sparkles, Activity } from "lucide-react";

interface TokenTickerProps {
  onSelectToken?: (token: Token) => void;
}

export const TokenTicker: React.FC<TokenTickerProps> = ({ onSelectToken }) => {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic tokens stream from /api/tokens
  useEffect(() => {
    let isMounted = true;

    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/tokens?limit=25");
        if (!res.ok) throw new Error("Failed to fetch tokens ticker");
        const data = await res.json();
        if (isMounted && data?.tokens && Array.isArray(data.tokens) && data.tokens.length > 0) {
          setTokens(data.tokens);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("TokenTicker fetch error:", err);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 20000); // 20s auto-refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTokenClick = (e: React.MouseEvent, token: Token) => {
    e.preventDefault();
    if (onSelectToken) {
      onSelectToken(token);
    } else {
      router.push(`/alpha-scanner?token=${encodeURIComponent(token.address)}`);
    }
  };

  // Helper to format prices cleanly
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  if (isLoading && tokens.length === 0) {
    return (
      <div className="w-full bg-[#08090D] border-b border-[#171922] py-1.5 px-4 overflow-hidden flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
          <span>Syncing Live Monad Feed...</span>
        </div>
      </div>
    );
  }

  // Double the tokens list for seamless infinite marquee loop
  const displayItems = [...tokens, ...tokens];

  return (
    <div className="w-full bg-[#08090D] border-b border-[#171922] py-1.5 overflow-hidden flex items-center group relative select-none">
      {/* Fixed Live Tag Badge on Left */}
      <div className="hidden sm:flex items-center gap-1.5 pl-3 pr-2.5 bg-[#08090D] z-10 shrink-0 border-r border-[#171922] shadow-[4px_0_8px_rgba(8,9,13,0.9)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00FFA3]">
          TESTNET TICKER
        </span>
      </div>

      {/* Marquee Track */}
      <div className="flex overflow-hidden w-full mask-gradient">
        <div className="flex items-center gap-4 animate-ticker-scroll group-hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
          {displayItems.map((token, idx) => {
            const isPositive = token.change24h >= 0;
            const isNew = token.isNewDeployment || token.launchTimeAgo.includes("m ago");

            return (
              <div
                key={`${token.id}-${idx}`}
                onClick={(e) => handleTokenClick(e, token)}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D0F14]/70 hover:bg-[#151824] border border-[#171922]/80 hover:border-[#7053F5]/60 transition-all cursor-pointer shrink-0"
                title={`${token.name} (${token.symbol}) - Click to inspect in Alpha Scanner`}
              >
                {/* Symbol & Name */}
                <div className="flex items-center gap-1">
                  {isNew && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#7053F5] animate-ping mr-0.5" />
                  )}
                  <span className="font-mono text-xs font-bold text-white tracking-tight">
                    {token.symbol.replace("$", "")}
                  </span>
                  {isNew && (
                    <span className="text-[8px] font-mono bg-[#7053F5]/20 text-[#7053F5] px-1 py-0.2 rounded font-bold uppercase">
                      NEW
                    </span>
                  )}
                </div>

                {/* Price in USD */}
                <span className="font-mono text-xs text-slate-300">
                  {formatPrice(token.priceUsd ?? token.price ?? 0)}
                </span>

                {/* 24h Percentage Badge */}
                <span
                  className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isPositive
                      ? "text-[#00FFA3] bg-[#00FFA3]/10"
                      : "text-[#FF4D4D] bg-[#FF4D4D]/10"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5 mr-0.5 stroke-[2.5]" />
                  )}
                  {isPositive ? "+" : ""}
                  {token.change24h.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
