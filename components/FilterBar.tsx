"use client";

import React, { useEffect, useState } from "react";
import { FilterCategory } from "@/types/token";
import { Flame, Waves, Crosshair, ShieldCheck, Sparkles, LayoutGrid } from "lucide-react";

interface FilterBarProps {
  currentCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  tokensCount: number;
}

const FILTERS: { id: FilterCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ALL", label: "All Assets", icon: LayoutGrid },
  { id: "MOMENTUM", label: "High Momentum", icon: Flame },
  { id: "WHALES", label: "Whale Inflows", icon: Waves },
  { id: "SNIPERS", label: "Smart Snipes", icon: Crosshair },
  { id: "LOW_RISK", label: "Low Risk (<30)", icon: ShieldCheck },
  { id: "NEW_LAUNCHES", label: "Launches <6h", icon: Sparkles },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  currentCategory,
  onSelectCategory,
  tokensCount,
}) => {
  const [wsRate, setWsRate] = useState(10240);

  useEffect(() => {
    const interval = setInterval(() => {
      setWsRate(Math.floor(10150 + Math.random() * 200));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#171922] bg-[#0D0F14] p-2.5">
      {/* Segmented Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((item) => {
          const Icon = item.icon;
          const isActive = currentCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7053F5] text-white shadow-[0_0_12px_rgba(112, 83, 245,0.35)]"
                  : "bg-[#060709] text-slate-400 hover:border-slate-600 hover:text-white border border-[#171922]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-1 rounded-full bg-black/30 px-1.5 py-0.2 font-mono text-[10px] text-white">
                  {tokensCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live WebSocket Status Indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-[#1E2230] bg-[#0E1017] px-3 py-1.5 text-xs">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <span className="font-mono text-[11px] font-medium text-slate-300">
          WS: CONNECTED
        </span>
        <span className="font-mono text-[10px] text-slate-500">|</span>
        <span className="font-mono text-[11px] font-semibold text-emerald-400">
          {wsRate.toLocaleString()} msg/s
        </span>
      </div>
    </div>
  );
};
