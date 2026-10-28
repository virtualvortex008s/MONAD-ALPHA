"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { MonadLogo } from "./MonadLogo";
import { HeaderWalletButton } from "./HeaderWalletButton";
import { mockTokens } from "@/data/mockTokens";
import { Token } from "@/types/token";

export { HeaderWalletButton } from "./HeaderWalletButton";

export interface TopBarProps {
  onOpenSearch?: () => void;
  onOpenFavorites?: () => void;
  onToggleSidebar?: () => void;
  onSelectToken?: (token: Token) => void;
  className?: string;
}

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const TopBar: React.FC<TopBarProps> = ({
  onSelectToken,
  className = "",
}) => {
  const router = useRouter();
  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Platform detection for keyboard shortcut
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  // Sync dynamic tokens from /api/tokens with fallback to mockTokens
  useEffect(() => {
    let ignore = false;
    fetch("/api/tokens")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data?.tokens && Array.isArray(data.tokens) && data.tokens.length > 0) {
          setTokens(data.tokens);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Validation: EVM Address Detection
  const trimmedQuery = searchQuery.trim();
  const isEvmAddress = useMemo(() => {
    return EVM_ADDRESS_REGEX.test(trimmedQuery);
  }, [trimmedQuery]);

  // Symbol / Name / Address Filtering
  const filteredTokens = useMemo(() => {
    if (!trimmedQuery) return [];
    const clean = trimmedQuery.toLowerCase().replace("$", "");
    return tokens.filter((t) => {
      const sym = t.symbol.toLowerCase().replace("$", "");
      const name = t.name.toLowerCase();
      const addr = t.address.toLowerCase();
      return sym.includes(clean) || name.includes(clean) || addr.includes(clean);
    });
  }, [tokens, trimmedQuery]);

  // Direct Address Match
  const addressMatchedToken = useMemo(() => {
    if (!isEvmAddress) return null;
    return tokens.find((t) => t.address.toLowerCase() === trimmedQuery.toLowerCase()) || null;
  }, [tokens, isEvmAddress, trimmedQuery]);

  // Handle navigation to token or scanner
  const handleInspectAddress = useCallback(
    (address: string) => {
      setIsDropdownOpen(false);
      const clean = address.trim();
      const match = tokens.find((t) => t.address.toLowerCase() === clean.toLowerCase());
      if (match && onSelectToken) {
        onSelectToken(match);
      } else {
        router.push(`/scanner?address=${encodeURIComponent(clean)}`);
      }
    },
    [router, tokens, onSelectToken]
  );

  const handleSelectToken = useCallback(
    (token: Token) => {
      setIsDropdownOpen(false);
      setSearchQuery("");
      if (onSelectToken) {
        onSelectToken(token);
      } else {
        router.push(`/scanner?address=${encodeURIComponent(token.address)}`);
      }
    },
    [onSelectToken, router]
  );

  const handleExecuteSearch = useCallback(() => {
    if (!trimmedQuery) return;
    if (isEvmAddress) {
      handleInspectAddress(trimmedQuery);
    } else if (filteredTokens.length > 0) {
      const target = filteredTokens[selectedIndex] || filteredTokens[0];
      handleSelectToken(target);
    } else {
      handleInspectAddress(trimmedQuery);
    }
  }, [
    trimmedQuery,
    isEvmAddress,
    handleInspectAddress,
    filteredTokens,
    selectedIndex,
    handleSelectToken,
  ]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setSelectedIndex(0);
  }, []);

  const handleCopy = useCallback((text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) {
          mobileInputRef.current?.focus();
          mobileInputRef.current?.select();
        } else {
          desktopInputRef.current?.focus();
          desktopInputRef.current?.select();
        }
        setIsDropdownOpen(true);
      } else if (e.key === "Escape") {
        handleClear();
        desktopInputRef.current?.blur();
        mobileInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleClear]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktop = desktopContainerRef.current?.contains(target);
      const isInsideMobile = mobileContainerRef.current?.contains(target);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation within the input (Arrow keys & Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (filteredTokens.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredTokens.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (filteredTokens.length > 0) {
        setSelectedIndex((prev) => (prev - 1 < 0 ? filteredTokens.length - 1 : prev - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleExecuteSearch();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClear();
    }
  };

  // Render Dropdown Content (shared by desktop and mobile)
  const renderDropdown = () => {
    if (!isDropdownOpen || !trimmedQuery) return null;

    return (
      <div
        className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-[#171922] bg-[#0D0F14]/98 backdrop-blur-xl p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Address Detected Special Action Card */}
        {isEvmAddress && (
          <div className="p-3 sm:p-3.5 bg-[#7053F5]/10 border border-[#7053F5]/30 rounded-xl mb-2.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold font-mono text-[#00FFA3] uppercase tracking-wider">
                  Monad EVM Contract Detected
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleCopy(trimmedQuery, e)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#171922] text-[10px] font-mono text-slate-300 hover:text-white transition cursor-pointer"
                title="Copy address"
              >
                {copied ? <Check className="h-3 w-3 text-[#00FFA3]" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="font-mono text-xs text-white break-all mb-3 select-all bg-[#08090C] p-2 rounded-lg border border-[#1E2230]">
              {trimmedQuery}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInspectAddress(trimmedQuery)}
                className="flex-1 min-w-[150px] px-3.5 py-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 shadow-md shadow-[#7053F5]/25 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Inspect in Alpha Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <a
                href={`https://testnet.monadexplorer.com/token/${trimmedQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl border border-[#1E2230] bg-[#12141C] hover:bg-[#1E2230] hover:text-[#00FFA3] text-slate-300 text-xs font-mono font-medium transition flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <span>View on Monad Explorer</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>

            {/* If there's an exact token match for this address, preview it */}
            {addressMatchedToken && (
              <div className="mt-3 pt-2.5 border-t border-[#7053F5]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">{addressMatchedToken.symbol}</span>
                  <span className="text-slate-400 truncate max-w-[120px]">{addressMatchedToken.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#00FFA3] font-bold">Alpha {addressMatchedToken.alphaScore}</span>
                  <span className="text-white">${addressMatchedToken.priceUsd.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtered Tokens List (by symbol or name) */}
        {filteredTokens.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span>Matching Tokens ({filteredTokens.length})</span>
              <span>Monad Testnet</span>
            </div>

            <div className="max-h-60 sm:max-h-68 overflow-y-auto divide-y divide-[#171922]/40">
              {filteredTokens.map((token, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={token.id || token.address}
                    onClick={() => handleSelectToken(token)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition cursor-pointer ${
                      isSelected
                        ? "bg-[#7053F5]/15 border border-[#7053F5]/30 shadow-[0_0_12px_rgba(112,83,245,0.15)]"
                        : "hover:bg-[#13161F] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2 flex-1">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#7053F5]/20 font-mono text-xs font-black text-[#7053F5] border border-[#7053F5]/30">
                        {token.symbol.replace("$", "").slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm font-mono">
                            {token.symbol}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[100px] sm:max-w-[140px]">
                            {token.name}
                          </span>
                          <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.2 font-mono text-[10px] text-[#7053F5] font-bold border border-[#7053F5]/30">
                            Alpha {token.alphaScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[130px] sm:max-w-xs">
                            {token.address}
                          </span>
                          <a
                            href={`https://testnet.monadexplorer.com/token/${token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-500 hover:text-[#7053F5] transition p-0.5"
                            title="View on Monad Explorer"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
                      <div>
                        <div className="font-mono text-xs font-bold text-white">
                          ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                        </div>
                        <span
                          className={`font-mono text-[10px] font-semibold ${
                            token.change24h >= 0 ? "text-[#00FFA3]" : "text-rose-400"
                          }`}
                        >
                          {token.change24h >= 0 ? "+" : ""}
                          {token.change24h}%
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State (when search query doesn't match any token and is not a 42-char address) */}
        {!isEvmAddress && filteredTokens.length === 0 && (
          <div className="py-6 px-4 text-center">
            <p className="text-xs text-slate-300 mb-1">
              No matching assets for &quot;<span className="text-white font-mono">{trimmedQuery}</span>&quot;
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Enter a standard 42-character contract address (0x...) or symbol (e.g. MON, CHOG, DAK) to inspect any asset on Monad Testnet.
            </p>
            {trimmedQuery.startsWith("0x") && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#171922] text-[10px] font-mono text-slate-400 border border-[#1E2230]">
                <span>EVM address length: {trimmedQuery.length}/42 chars</span>
              </div>
            )}
          </div>
        )}

        {/* Dropdown Footer Shortcuts */}
        <div className="flex items-center justify-between border-t border-[#171922] pt-2 mt-1 px-2 text-[10px] font-mono text-slate-500">
          <div className="hidden sm:flex items-center gap-2.5">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#171922] text-slate-400 mr-1">↑↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#171922] text-slate-400 mr-1">↵</kbd>
              Inspect
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#171922] text-slate-400 mr-1">Esc</kbd>
              Clear
            </span>
          </div>
          <span className="text-slate-400">Monad Contract Scanner</span>
          <span className="flex items-center gap-1.5 text-[#00FFA3]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span>Chain ID 10143</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[#060709]/90 backdrop-blur-md border-b border-[#171922] px-4 lg:px-8 py-3 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <MonadLogo size={32} className="transition-transform duration-200 group-hover:scale-105" />
            <span className="font-bold text-lg tracking-tight text-white">
              Monad <span className="text-[#7053F5]">Alpha</span>
            </span>
          </Link>
        </div>

        {/* Center: Token Contract Search Bar (Desktop / Tablet: sm+) */}
        <div ref={desktopContainerRef} className="flex-1 max-w-xl mx-auto hidden sm:block relative">
          <div
            className={`relative flex items-center rounded-xl bg-[#0D0F14] border border-[#171922] transition-all duration-200 ${
              isDropdownOpen
                ? "border-[#7053F5] ring-2 ring-[#7053F5]/30 shadow-[0_0_20px_rgba(112,83,245,0.25)]"
                : "hover:border-slate-700"
            }`}
          >
            {/* Left Search Icon */}
            <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#7053F5]">
              <Search className="h-4 w-4 shrink-0" />
            </div>

            {/* Search Input */}
            <input
              ref={desktopInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search token contract address (0x...) or symbol on Monad..."
              className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none min-w-0 pr-24"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Right Action Elements */}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {trimmedQuery ? (
                <>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1E2230] transition cursor-pointer"
                    title="Clear input (Esc)"
                    aria-label="Clear search input"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSearch}
                    className="px-2 py-0.5 rounded-md bg-[#7053F5] hover:bg-[#5E3FEB] text-white text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                    title="Search / Inspect"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#1E2230] bg-[#12141C] text-[10px] font-mono text-slate-400 select-none">
                  {isMac ? "⌘K" : "Ctrl+K"}
                </kbd>
              )}
            </div>
          </div>

          {/* Desktop Search Dropdown Overlay */}
          {renderDropdown()}
        </div>

        {/* Right: Connect MetaMask Wallet Button */}
        <div className="flex items-center gap-3 shrink-0">
          <HeaderWalletButton />
        </div>
      </div>

      {/* Mobile Search Bar: Appears on small screens below the header if screen width < 640px */}
      <div ref={mobileContainerRef} className="sm:hidden mt-2 pt-2 border-t border-[#171922]/50 relative">
        <div
          className={`relative flex items-center rounded-xl bg-[#0D0F14] border border-[#171922] transition-all duration-200 ${
            isDropdownOpen
              ? "border-[#7053F5] ring-1 ring-[#7053F5]/30 shadow-[0_0_15px_rgba(112,83,245,0.25)]"
              : "hover:border-slate-700"
          }`}
        >
          <div className="pl-3 pr-2 flex items-center pointer-events-none text-[#7053F5]">
            <Search className="h-3.5 w-3.5 shrink-0" />
          </div>

          <input
            ref={mobileInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search contract (0x...) or symbol..."
            className="w-full bg-transparent py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none min-w-0 pr-16"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {trimmedQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[#1E2230] bg-[#12141C] text-[9px] font-mono text-slate-400 select-none">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            )}
          </div>
        </div>

        {/* Mobile Search Dropdown Overlay */}
        {renderDropdown()}
      </div>
    </header>
  );
};

export default TopBar;
