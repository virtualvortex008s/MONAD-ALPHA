"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { MonadLogo } from "./MonadLogo";
import { MetaMaskLogo } from "@/components/icons/MetaMaskLogo";
import { useWallet } from "@/context/WalletContext";
import { HeaderWalletButton } from "./HeaderWalletButton";
export { HeaderWalletButton } from "./HeaderWalletButton";

interface TopBarProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onToggleSidebar,
}) => {
  const pathname = usePathname();
  const { isConnected, connectWallet } = useWallet();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Derive page title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/alpha-scanner") || pathname.startsWith("/new-launches")) return "Alpha Scanner";
    if (pathname.startsWith("/portfolio")) return "Portfolio Intelligence";
    return "Dashboard";
  };

  return (
    <>
      <div className="sticky top-0 z-30 w-full flex flex-col bg-[#060709]/95 backdrop-blur-md border-b border-[#171922]">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
          {/* Left: Mobile hamburger & Brand / Dynamic page title */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#13161F] transition cursor-pointer shrink-0"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Brand Logo (<lg) */}
            <Link href="/" className="flex lg:hidden items-center gap-2 group shrink-0">
              <MonadLogo size={28} />
              <div className="flex items-center gap-1 leading-none">
                <span className="font-bold text-xs sm:text-sm text-white tracking-tight">MONAD</span>
                <span className="font-bold text-xs sm:text-sm text-[#7053F5] font-mono">ALPHA</span>
              </div>
            </Link>

            {/* Desktop Page Title (lg+) */}
            <div className="hidden lg:block min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none truncate">
                {getPageTitle()}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse shrink-0" />
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider truncate">
                  Monad Testnet · 10,000 TPS · Real-Time
                </span>
              </div>
            </div>

            {/* Compact Testnet Indicator for Tablets (sm -> lg) */}
            <div className="hidden sm:flex lg:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-[10px] font-mono text-[#00FFA3] font-bold">
                Testnet
              </span>
            </div>
          </div>

          {/* Right: Quick Search, Notifications & Web3 Wallet */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Global Search Trigger: Icon on <640px, full bar on >=640px */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 rounded-xl border border-[#171922] bg-[#0D0F14] p-2 sm:px-3 sm:py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white transition shadow-sm cursor-pointer"
              aria-label="Search tokens, pools, and smart wallets"
            >
              <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400" />
              <span className="hidden sm:inline font-mono">Search...</span>
              <span className="hidden md:inline-flex items-center rounded border border-[#1E2230] bg-[#171922] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </span>
            </button>

            {/* Live Signals & Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative p-2 rounded-xl border border-[#171922] bg-[#0D0F14] text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7053F5] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7053F5]" />
                </span>
              </button>

              {/* Notifications Popup */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#171922] bg-[#0D0F14] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#171922]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Live Alpha Signals
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-1.5 py-0.5 rounded border border-[#00FFA3]/20">
                      Real-time
                    </span>
                  </div>

                  <div className="divide-y divide-[#171922]/50 max-h-72 overflow-y-auto">
                    <div className="py-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                        <span className="text-[#00FFA3] font-bold">Whale Inflow</span>
                        <span className="text-slate-500">Just now</span>
                      </div>
                      <p className="text-slate-300 text-xs font-medium">
                        $MONX swap spike: <span className="text-white font-bold">14,200 MON</span>
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Smart wallet 0x38...29f initiated high conviction position.
                      </p>
                    </div>

                    <div className="py-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                        <span className="text-[#7053F5] font-bold">Alpha Score Breakout</span>
                        <span className="text-slate-500">2m ago</span>
                      </div>
                      <p className="text-slate-300 text-xs font-medium">
                        $ECHO score reached <span className="text-[#00FFA3] font-bold">91/100</span>
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Volume momentum &amp; contract safety confirmed by AI engine.
                      </p>
                    </div>

                    <div className="py-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                        <span className="text-amber-400 font-bold">New Liquidity Pool</span>
                        <span className="text-slate-500">8m ago</span>
                      </div>
                      <p className="text-slate-300 text-xs font-medium">
                        $FLUX-MON Uniswap V3 Pool
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        Initial liquidity locked: $250,000 USD on Monad Testnet.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#171922] text-center">
                    <Link
                      href="/alpha-scanner"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[11px] font-mono text-[#7053F5] hover:text-[#5E3FEB] font-bold"
                    >
                      View Live Alpha Scanner →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* PURE WEB3: Real MetaMask Connection */}
            <HeaderWalletButton />
          </div>
        </div>

        {/* Dismissible Sub-banner for Unconnected Users */}
        {!isBannerDismissed && !isConnected && (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 bg-[#7053F5]/10 border-t border-[#171922] text-xs">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse shrink-0" />
              <span className="truncate">
                Connect your MetaMask wallet on Monad Testnet to unlock{" "}
                <span className="text-white font-medium">Portfolio analysis · Alpha Scanner · Gemini AI Dossiers</span>
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={connectWallet}
                className="text-xs font-bold text-[#7053F5] hover:text-[#5E3FEB] flex items-center gap-1.5 cursor-pointer"
              >
                <MetaMaskLogo size={14} />
                <span>Connect Wallet</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsBannerDismissed(true)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
