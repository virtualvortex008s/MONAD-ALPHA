"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Token } from "@/types/token";
import { useFavorites } from "@/hooks/useFavorites";
import {
  X,
  Star,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Radar,
  Coins,
  Shield,
  Zap,
} from "lucide-react";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken?: (token: Token) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectToken,
}) => {
  const { favorites, removeFavorite, clearFavorites, favoritesCount } = useFavorites();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setConfirmClear(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleRemove = (addressOrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(addressOrId);
  };

  const handleTokenClick = (token: Token) => {
    if (onSelectToken) {
      onSelectToken(token);
    }
    onClose();
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md sm:max-w-lg bg-[#0D0F14] border-l border-[#171922] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#171922] flex items-center justify-between bg-[#060709]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 shadow-[0_0_15px_rgba(245,166,35,0.25)]">
                <Star className="h-4.5 w-4.5 fill-[#F5A623]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight font-mono">
                    Favorite Assets
                  </h2>
                  <span className="rounded-full bg-[#7053F5]/20 border border-[#7053F5]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#7053F5]">
                    {favoritesCount} {favoritesCount === 1 ? "Asset" : "Assets"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Persistent watchlisted tokens saved on Monad Testnet
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#171922] transition cursor-pointer"
              aria-label="Close favorites drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {favorites.length === 0 ? (
              /* Empty State */
              <div className="py-16 px-4 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#171922] text-[#4A5568] mx-auto border border-[#1E2230]">
                  <Star className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div className="max-w-sm mx-auto space-y-1.5">
                  <h3 className="text-sm font-bold text-white font-mono">
                    No favorite assets yet
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Click the star icon on any token in the Alpha Scanner to track it here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/alpha-scanner"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white text-xs font-bold font-mono transition shadow-lg shadow-[#7053F5]/25"
                  >
                    <Radar className="h-4 w-4" />
                    <span>Explore Alpha Scanner</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Populated State */
              <div className="space-y-2.5">
                {favorites.map((token) => {
                  const isPositive = token.change24h >= 0;
                  const isCopied = copiedAddress === token.address;
                  const tokenPrice = token.priceUsd ?? token.price ?? 0;

                  return (
                    <div
                      key={token.id || token.address}
                      onClick={() => handleTokenClick(token)}
                      className="group rounded-xl border border-[#171922] bg-[#0E1017] p-3.5 hover:border-[#7053F5]/50 hover:bg-[#131622] transition-all cursor-pointer shadow-md space-y-3"
                    >
                      {/* Top Row: Symbol, Name, Price, and Remove Button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7053F5]/20 to-[#12141C] border border-[#7053F5]/30 font-mono text-xs font-black text-white shrink-0 group-hover:border-[#7053F5] transition">
                            {token.symbol.replace("$", "").slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm group-hover:text-[#7053F5] transition truncate">
                                {token.symbol}
                              </span>
                              <span className="text-[11px] text-slate-400 font-sans truncate hidden sm:inline">
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
                                className="text-slate-500 hover:text-white p-0.5 rounded transition cursor-pointer"
                                title="Copy contract address"
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3 text-[#00FFA3]" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                              <a
                                href={`https://testnet.monadexplorer.com/token/${token.address}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-500 hover:text-[#7053F5] p-0.5 rounded transition"
                                title="View on Monad Explorer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Price and Instant Remove Action */}
                        <div className="flex items-start gap-2 text-right shrink-0">
                          <div>
                            <div className="font-mono text-sm font-bold text-white">
                              {formatPrice(tokenPrice)}
                            </div>
                            <div
                              className={`flex items-center justify-end gap-0.5 text-[11px] font-mono font-bold mt-0.5 ${
                                isPositive ? "text-[#00FFA3]" : "text-[#FF4D4D]"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              <span>
                                {isPositive ? "+" : ""}
                                {token.change24h.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleRemove(token.address || token.id, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer ml-1"
                            title="Remove from favorites"
                            aria-label={`Remove ${token.symbol} from favorites`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Info Bar: Badges & Deep Dive link */}
                      <div className="pt-2 border-t border-[#171922] flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded bg-[#171922] px-2 py-0.5 text-slate-300">
                            <Zap className="h-2.5 w-2.5 text-[#00FFA3]" />
                            Alpha {token.alphaScore}/100
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-[#171922] px-2 py-0.5 text-slate-300">
                            <Shield className="h-2.5 w-2.5 text-[#7053F5]" />
                            Risk {token.riskScore}/100
                          </span>
                        </div>

                        <span className="text-[#7053F5] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                          Inspect <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {favorites.length > 0 && (
            <div className="p-4 border-t border-[#171922] bg-[#060709] space-y-2.5">
              {confirmClear ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 space-y-2 animate-in fade-in duration-150">
                  <p className="text-xs text-rose-300 font-mono text-center">
                    Are you sure you want to remove all {favorites.length} saved tokens?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearFavorites();
                        setConfirmClear(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition cursor-pointer"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-1.5 rounded-lg bg-[#171922] hover:bg-[#1E2230] text-slate-300 text-xs font-mono transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All Favorites</span>
                  </button>

                  <Link
                    href="/alpha-scanner"
                    onClick={onClose}
                    className="flex items-center gap-1 text-xs font-mono text-[#7053F5] hover:text-[#5E3FEB] font-bold transition"
                  >
                    <span>Add More</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
