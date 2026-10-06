"use client";

import React from "react";
import { MonadLogo } from "./MonadLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-[#171922] bg-[#060709] py-8 text-xs text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MonadLogo size={22} className="rounded-full shadow-[0_0_10px_rgba(112,83,245,0.35)]" />
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold tracking-tight text-white font-sans">
                MONAD
              </span>
              <span className="font-bold text-[#7053F5] font-mono">
                ALPHA
              </span>
            </div>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All Systems Operational
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          <a
            href="https://docs.monad.xyz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Docs
          </a>
          <a
            href="https://testnet.monadexplorer.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            MonadExplorer
          </a>
          <span className="font-mono text-slate-400">
            Chain ID: 10143
          </span>
          <span className="font-mono text-slate-400">
            10k TPS / 1s Finality
          </span>
        </div>
      </div>
    </footer>
  );
};
