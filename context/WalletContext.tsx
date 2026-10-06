"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export const MONAD_TESTNET_CONFIG = {
  chainId: "0x279f", // 10143 in hex
  chainName: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
};

export const MONAD_TESTNET_CHAIN_ID = 10143;

interface WalletContextType {
  address: `0x${string}` | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  copyAddress: () => void;
  isCopied: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  copyAddress: () => {},
  isCopied: false,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch balance via MetaMask to avoid browser CORS
  const fetchBalance = async (userAddress: `0x${string}`) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const hexBalance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [userAddress, "latest"],
        });
        if (hexBalance) {
          const formatted = parseFloat(formatEther(BigInt(hexBalance as string))).toFixed(3);
          setBalance(formatted);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch balance via MetaMask:", e);
      setBalance("0.000");
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setIsConnecting(true);

      // 1. Request accounts (Safe, standard, zero extension crash)
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const userAddress = accounts[0] as `0x${string}`;

      // 2. Ensure user is switched to Monad Testnet (Chain ID 10143)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_TESTNET_CONFIG],
          });
        }
      }

      // 3. PHYSICAL METAMASK POPUP: Request Gasless Handshake Signature
      // This physically opens the MetaMask window and requires the user to click "Sign" / "Authorize"
      const authMessage = `Welcome to Monad Alpha!\n\nAuthorize connection to Monad Testnet.\n\nWallet: ${userAddress}\nTimestamp: ${new Date().toISOString()}`;
      
      // Convert message to hex for MetaMask personal_sign
      const hexMessage = `0x${Array.from(new TextEncoder().encode(authMessage))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      await window.ethereum.request({
        method: "personal_sign",
        params: [hexMessage, userAddress],
      });

      // 4. Set state once authorized
      setAddress(userAddress);

      // 5. Fetch real native $MON balance
      try {
        const hexBalance = (await window.ethereum.request({
          method: "eth_getBalance",
          params: [userAddress, "latest"],
        })) as string;

        if (hexBalance) {
          const formatted = parseFloat(formatEther(BigInt(hexBalance))).toFixed(3);
          setBalance(formatted);
        }
      } catch (balErr) {
        console.warn("Could not fetch balance:", balErr);
        setBalance("0.000");
      }

    } catch (error: any) {
      if (error?.code === 4001) {
        console.log("User cancelled connection/signature in MetaMask.");
      } else {
        console.error("MetaMask connection failed:", error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
  };

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [address]);

  // Listen for account/network changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length > 0) {
          const userAddress = accts[0] as `0x${string}`;
          setAddress(userAddress);
          fetchBalance(userAddress);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected: !!address,
        isConnecting,
        connectWallet,
        disconnectWallet,
        copyAddress,
        isCopied,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
