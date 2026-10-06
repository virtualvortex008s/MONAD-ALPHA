"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { MetaMaskLogo } from "@/components/MetaMaskLogo";

export const HeaderWalletButton = () => {
  const { isConnected, isConnecting, address, balance, connectWallet, disconnectWallet } = useWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-[#7053F5]/30 transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <MetaMaskLogo size={18} />
        <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D0F14] border border-[#171922] font-mono text-xs shadow-sm">
      <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse"></span>
      <span className="text-white font-bold">{balance ? `${balance} MON` : "0.000 MON"}</span>
      <span className="text-slate-600">|</span>
      <span className="text-slate-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      <button
        onClick={disconnectWallet}
        className="ml-2 text-slate-500 hover:text-red-400 text-[10px] transition cursor-pointer"
      >
        Disconnect
      </button>
    </div>
  );
};
