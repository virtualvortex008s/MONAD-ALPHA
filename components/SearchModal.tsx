"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Token } from "@/types/token";
import { Search, X, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  onSelectToken: (token: Token) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filtered = tokens.filter((t) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.symbol.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filtered.length - 1) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectToken(filtered[selectedIndex]);
        handleClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-[#171922] bg-[#0D0F14] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center border-b border-[#1E2230] px-3.5 sm:px-4 py-3 sm:py-3.5 bg-[#0E1017]">
          <Search className="h-4 sm:h-5 w-4 sm:w-5 text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tokens, symbols, or 0x contract address..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none min-w-0"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="rounded p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="rounded border border-[#1E2230] bg-[#12141C] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 sm:p-2 divide-y divide-[#1E2230]/50">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching assets found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((token, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={token.id}
                  onClick={() => {
                    onSelectToken(token);
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-xl p-2.5 sm:p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#7053F5]/15 border border-[#7053F5]/30"
                      : "hover:bg-[#191C27] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#7053F5]/20 font-mono text-xs font-black text-[#7053F5]">
                      {token.symbol.replace("$", "").slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {token.symbol}
                        </span>
                        <span className="text-xs text-slate-400 truncate max-w-[85px] sm:max-w-none">
                          {token.name}
                        </span>
                        <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.2 font-mono text-[10px] text-[#7053F5] font-bold">
                          Alpha {token.alphaScore}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 truncate block max-w-[130px] sm:max-w-xs">
                        {token.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">
                        ${token.priceUsd < 0.01 ? token.priceUsd.toFixed(6) : token.priceUsd.toFixed(4)}
                      </div>
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          token.change1h >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {token.change1h >= 0 ? "+" : ""}
                        {token.change1h}%
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[#1E2230] bg-[#0E1017] px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] text-slate-500">
          <div className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="rounded bg-[#191C27] px-1 py-0.5 text-[10px] text-slate-400 mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="rounded bg-[#191C27] px-1 py-0.5 text-[10px] text-slate-400 mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Monad Alpha Omni-Search
          </span>
          <span className="text-[10px] text-slate-500 sm:hidden">
            Tap to inspect
          </span>
        </div>
      </div>
    </div>
  );
};
