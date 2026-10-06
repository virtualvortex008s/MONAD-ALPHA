"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { MetaMaskLogo } from "@/components/icons/MetaMaskLogo";

export const HeaderWalletButton = () => {
  const { isConnected, isConnecting, address, balance, connectWallet, disconnectWallet } = useWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-[#7053F5]/30 transition flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0"
      >
        <MetaMaskLogo size={16} />
        <span>
          {isConnecting ? (
            "Connecting..."
          ) : (
            <>
              <span className="inline sm:hidden">Connect</span>
              <span className="hidden sm:inline">Connect MetaMask</span>
            </>
          )}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-xl bg-[#0D0F14] border border-[#171922] font-mono text-xs shadow-sm shrink-0">
      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00FFA3] animate-pulse shrink-0"></span>
      <span className="hidden md:inline text-white font-bold">{balance ? `${balance} MON` : "0.000 MON"}</span>
      <span className="hidden md:inline text-slate-600">|</span>
      <span className="text-slate-200 font-bold">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      <button
        onClick={disconnectWallet}
        className="ml-1 sm:ml-2 text-slate-500 hover:text-red-400 text-[10px] transition cursor-pointer p-0.5 rounded hover:bg-[#1E2230]"
        title="Disconnect wallet"
        aria-label="Disconnect wallet"
      >
        ✕
      </button>
    </div>
  );
};
