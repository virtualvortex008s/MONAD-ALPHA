"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radar,
  Briefcase,
  BookOpen,
  ExternalLink,
  X,
  Radio,
  Fuel,
} from "lucide-react";
import { openHandbook } from "./FloatingHandbook";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isRouteActive = (path: string, exact: boolean = false) => {
    if (exact) return pathname === path;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `group flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
      active
        ? "bg-[#7053F5]/15 text-white border-l-2 border-[#7053F5] shadow-[inset_0_0_12px_rgba(112,83,245,0.15)] font-semibold"
        : "text-slate-400 hover:text-white hover:bg-[#13161F]"
    }`;

  const navIconClass = (active: boolean) =>
    `h-4 w-4 shrink-0 transition-colors ${
      active ? "text-[#7053F5]" : "text-slate-500 group-hover:text-slate-300"
    }`;

  const handleOpenHandbook = () => {
    openHandbook();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 max-w-[85vw] sm:w-64 flex-col border-r border-[#171922] bg-[#060709] transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl shadow-black/80" : "-translate-x-full"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-[#171922]">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#7053F5]/20 border border-[#7053F5]/40 shadow-[0_0_15px_rgba(112,83,245,0.35)] group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm text-[#7053F5] font-mono">[M]</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-sm text-white tracking-tight">MONAD</span>
                <span className="font-bold text-sm text-[#7053F5] font-mono">ALPHA</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00FFA3] font-semibold">
                  LIVE · TESTNET
                </span>
              </div>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#13161F] transition cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Section 1: CORE */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              CORE PLATFORM
            </div>
            <div className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className={navItemClass(isRouteActive("/", true))}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={navIconClass(isRouteActive("/", true))} />
                  <span>Dashboard</span>
                </div>
              </Link>

              <Link
                href="/alpha-scanner"
                onClick={onClose}
                className={navItemClass(isRouteActive("/alpha-scanner") || isRouteActive("/new-launches"))}
              >
                <div className="flex items-center gap-3">
                  <Radar className={navIconClass(isRouteActive("/alpha-scanner") || isRouteActive("/new-launches"))} />
                  <span>Alpha Scanner</span>
                </div>
                <span className="rounded bg-[#00FFA3]/15 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#00FFA3] border border-[#00FFA3]/30">
                  NEW
                </span>
              </Link>
            </div>
          </div>

          {/* Section 2: PERSONAL & TOOLS */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              PERSONAL & TOOLS
            </div>
            <div className="space-y-1">
              <Link
                href="/portfolio"
                onClick={onClose}
                className={navItemClass(isRouteActive("/portfolio"))}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={navIconClass(isRouteActive("/portfolio"))} />
                  <span>Portfolio</span>
                </div>
                <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#7053F5]">
                  ON-CHAIN
                </span>
              </Link>

              {/* Interactive Handbook Trigger */}
              <button
                type="button"
                onClick={handleOpenHandbook}
                className={`w-full text-left ${navItemClass(false)}`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={navIconClass(false)} />
                  <span>Handbook & Guide</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-[#7053F5] transition-colors">
                  DOCS
                </span>
              </button>

              {/* Monad Testnet Faucet Link */}
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noreferrer"
                className={navItemClass(false)}
              >
                <div className="flex items-center gap-3">
                  <Fuel className={navIconClass(false)} />
                  <span>Get Testnet MON</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="p-3 border-t border-[#171922] bg-[#060709]">
          <div className="rounded-xl border border-[#171922] bg-[#0D0F14] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-[#00FFA3] animate-pulse" />
                <span className="text-[11px] font-bold text-white font-mono">Parallel Engine</span>
              </div>
              <span className="rounded bg-[#00FFA3]/15 px-1.5 py-0.5 text-[9px] font-mono text-[#00FFA3] font-bold">
                10K TPS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Sub-second block finality with direct Monad RPC websocket sync.
            </p>
            <div className="mt-2.5 pt-2 border-t border-[#171922] flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Chain ID: 10143</span>
              <a
                href="https://testnet.monadexplorer.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#7053F5] flex items-center gap-0.5 text-slate-400"
              >
                Explorer <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
