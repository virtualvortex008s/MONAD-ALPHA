"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiveBlockData, LiveTransaction } from "@/lib/monad";
import { MonadLogo } from "./MonadLogo";
import {
  Boxes,
  ExternalLink,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Pause,
  Play,
  Activity,
} from "lucide-react";

interface LiveBlockStreamProps {
  onSelectAddress?: (address: string) => void;
}

export const LiveBlockStream: React.FC<LiveBlockStreamProps> = ({
  onSelectAddress,
}) => {
  const [currentBlock, setCurrentBlock] = useState<LiveBlockData | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<LiveBlockData[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  const fetchLiveBlock = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks/live");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.block) {
        const newBlock: LiveBlockData = data.block;

        setCurrentBlock((prev) => {
          if (!prev || prev.number !== newBlock.number) {
            setLastFetchedAt(new Date());
            setSecondsAgo(0);
            return newBlock;
          }
          return prev;
        });

        setRecentBlocks((prev) => {
          if (prev.some((b) => b.number === newBlock.number)) return prev;
          return [newBlock, ...prev.slice(0, 5)];
        });
      }
    } catch (err) {
      console.warn("Live block polling error:", err);
    }
  }, []);

  // Poll block every 1800ms to match Monad's 1-second block frequency
  useEffect(() => {
    let ignore = false;

    const tick = async () => {
      if (!isPaused && !ignore) {
        await fetchLiveBlock();
      }
    };

    tick();
    const interval = setInterval(tick, 1800);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchLiveBlock, isPaused]);

  // Second ticker for latency display
  useEffect(() => {
    if (!lastFetchedAt) return;
    const ticker = setInterval(() => {
      const diff = Math.floor((Date.now() - lastFetchedAt.getTime()) / 1000);
      setSecondsAgo(diff);
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastFetchedAt]);

  const blockNumberFormatted = currentBlock
    ? parseInt(currentBlock.number).toLocaleString()
    : "61,450,000+";

  return (
    <div className="rounded-2xl border border-[#1E2230] bg-[#12141C] p-5 shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2230] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7053F5]/15 border border-[#7053F5]/30 text-[#7053F5]">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Live Monad Block Stream
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                1s DIRECT RPC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>https://testnet-rpc.monad.xyz</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#7053F5]">Chain ID: 10143</span>
            </p>
          </div>
        </div>

        {/* Controls & Quick Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
              isPaused
                ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                : "border-[#1E2230] bg-[#0E1017] text-slate-400 hover:text-white"
            }`}
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </>
            )}
          </button>

          <a
            href="https://testnet.monadexplorer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-xl border border-[#7053F5]/40 bg-[#7053F5]/10 px-3 py-1.5 text-xs font-mono font-bold text-[#7053F5] hover:bg-[#7053F5]/20 transition-all"
          >
            <span>Monad Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Block Height */}
        <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Current Height</span>
            <MonadLogo size={12} />
          </div>
          <div className="mt-1 font-mono text-xl font-black text-white flex items-baseline gap-1">
            <span>#{blockNumberFormatted}</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Mined ~{secondsAgo}s ago</span>
          </div>
        </div>

        {/* Transactions in Block */}
        <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Txs In Block</span>
            <Activity className="h-3.5 w-3.5 text-[#7053F5]" />
          </div>
          <div className="mt-1 font-mono text-xl font-black text-[#7053F5]">
            {currentBlock ? currentBlock.transactionsCount : "—"}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Parallel execution
          </div>
        </div>

        {/* Gas Used */}
        <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Gas Consumed</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-black text-slate-200 truncate">
            {currentBlock ? parseInt(currentBlock.gasUsed).toLocaleString() : "—"}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
            Limit: 150M gas/block
          </div>
        </div>

        {/* Execution Finality */}
        <div className="rounded-xl border border-[#1E2230] bg-[#0E1017] p-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>Validator Finality</span>
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 font-mono text-xl font-black text-emerald-400">
            0.81s
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Single-slot finality
          </div>
        </div>
      </div>

      {/* Recent Blocks Progression Ribbon */}
      {recentBlocks.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Validator Block Sequence
            </span>
            <span className="text-[11px] text-slate-500">
              Live updates from Monad consensus
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentBlocks.map((b, idx) => (
              <a
                key={b.number}
                href={`https://testnet.monadexplorer.com/block/${b.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group shrink-0 rounded-xl border px-3 py-2 transition-all font-mono text-xs ${
                  idx === 0
                    ? "border-[#7053F5]/50 bg-[#7053F5]/10 text-white shadow-[0_0_12px_rgba(112, 83, 245,0.2)]"
                    : "border-[#1E2230] bg-[#0E1017] text-slate-400 hover:border-slate-600 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white group-hover:text-[#7053F5]">
                    #{parseInt(b.number).toLocaleString()}
                  </span>
                  {idx === 0 && (
                    <span className="rounded bg-[#7053F5] px-1.5 py-0.2 text-[9px] font-black text-white">
                      LATEST
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between gap-3">
                  <span>{b.transactionsCount} txs</span>
                  <span className="truncate max-w-[80px]">
                    {b.hash.slice(0, 6)}...
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Live Verified Transactions from Latest Block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified On-Chain Transactions ({currentBlock?.transactions.length || 0})
          </span>
          <span className="text-[11px] text-[#7053F5]">
            Click any hash to verify on Monad Testnet Explorer
          </span>
        </div>

        {currentBlock && currentBlock.transactions.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {currentBlock.transactions.map((tx: LiveTransaction) => (
              <div
                key={tx.hash}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1E2230] bg-[#0E1017] p-3 transition-all hover:border-[#7053F5]/40 hover:bg-[#141722]"
              >
                {/* Left: Tx Hash & Verification */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7053F5]/15 text-[#7053F5] border border-[#7053F5]/25 shrink-0">
                    <MonadLogo size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-bold text-slate-200 hover:text-[#7053F5] flex items-center gap-1 transition-colors"
                        title="View verified transaction on Monad Explorer"
                      >
                        <span className="text-white">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </span>
                        <ExternalLink className="h-3 w-3 text-[#7053F5]" />
                      </a>
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        MINED
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                      <span
                        onClick={() => onSelectAddress && tx.from && onSelectAddress(tx.from)}
                        className="hover:text-slate-300 cursor-pointer"
                      >
                        From: {tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : "—"}
                      </span>
                      {tx.to && (
                        <>
                          <ArrowRight className="h-2.5 w-2.5 text-slate-600" />
                          <span
                            onClick={() => onSelectAddress && onSelectAddress(tx.to!)}
                            className="hover:text-slate-300 cursor-pointer"
                          >
                            To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Value & Explorer Button */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-mono text-xs font-bold text-white">
                      {tx.valueMon} MON
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Native Monad
                    </div>
                  </div>

                  <a
                    href={`https://testnet.monadexplorer.com/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-[#1E2230] bg-[#161924] px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:border-[#7053F5] hover:text-white transition-all shrink-0"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#1E2230] bg-[#0E1017]/50 p-6 text-center text-xs font-mono text-slate-500 space-y-1">
            <p>Validator Consensus Block #{blockNumberFormatted} confirmed.</p>
            <p className="text-[11px] text-slate-600">
              Zero pending state transitions in this slot. Monad parallel pipeline ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
