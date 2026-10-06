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

// Helper to detect mobile operating systems
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || navigator.vendor || (window as any).opera
  );
};

// Check if currently running inside MetaMask's mobile in-app browser
export const isInMetaMaskBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).ethereum?.isMetaMask && isMobileDevice()
  );
};

// Generate MetaMask Universal Deep Link with auto-connect parameter
export const getMetaMaskDeepLink = (url?: string): string => {
  if (typeof window === "undefined") return "https://metamask.app.link/dapp/";
  const target = url || window.location.href;
  const urlWithoutProtocol = target.replace(/^https?:\/\//i, "");
  const separator = urlWithoutProtocol.includes("?") ? "&" : "?";
  const autoConnectParam = urlWithoutProtocol.includes("autoConnect=true")
    ? urlWithoutProtocol
    : `${urlWithoutProtocol}${separator}autoConnect=true`;
  return `https://metamask.app.link/dapp/${autoConnectParam}`;
};

interface WalletContextType {
  address: `0x${string}` | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  copyAddress: () => void;
  isCopied: boolean;
  isMobile: boolean;
  isInMetaMask: boolean;
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
  isMobile: false,
  isInMetaMask: false,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInMetaMask, setIsInMetaMask] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setIsInMetaMask(isInMetaMaskBrowser());
  }, []);

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

  const connectWallet = useCallback(async () => {
    // 1. If window.ethereum is not found (e.g., standard Mobile Safari / Chrome)
    if (typeof window === "undefined" || !window.ethereum) {
      if (isMobileDevice()) {
        // Redirect directly into the MetaMask mobile app via Universal Deep Link
        const deepLink = getMetaMaskDeepLink();
        window.location.href = deepLink;
        return;
      }

      // Desktop fallback: Open MetaMask download page
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setIsConnecting(true);

      // 2. Request accounts (Safe, standard, zero extension crash)
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const userAddress = accounts[0] as `0x${string}`;

      // 3. Ensure user is switched to Monad Testnet (Chain ID 10143)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_TESTNET_CONFIG],
          });
        }
      }

      // 4. Gasless Handshake Signature (Personal Sign)
      const authMessage = `Welcome to Monad Alpha!\n\nAuthorize connection to Monad Testnet.\n\nWallet: ${userAddress}\nTimestamp: ${new Date().toISOString()}`;
      
      const hexMessage = `0x${Array.from(new TextEncoder().encode(authMessage))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      try {
        await window.ethereum.request({
          method: "personal_sign",
          params: [hexMessage, userAddress],
        });
      } catch (signError: any) {
        if (signError?.code === 4001) {
          console.warn("User cancelled signature handshake in MetaMask.");
          return;
        }
        console.warn("Personal sign handshake warning:", signError);
      }

      // 5. Set authorized state
      setAddress(userAddress);
      fetchBalance(userAddress);

    } catch (error: any) {
      if (error?.code === 4001) {
        console.log("User cancelled connection in MetaMask.");
      } else {
        console.error("MetaMask connection failed:", error);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

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

  // Check on mount: auto-connect if query param autoConnect=true is present or silent auth if inside MetaMask
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const shouldAutoConnect = urlParams.get("autoConnect") === "true";

    if (window.ethereum) {
      // 1. If redirected via MetaMask deep link, clean up URL and trigger connection
      if (shouldAutoConnect) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("autoConnect");
        window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : "") + cleanUrl.hash);

        connectWallet();
      } else {
        // 2. Silent reconnect: check if account is already authorized
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            const accts = accounts as string[];
            if (accts && accts.length > 0) {
              const userAddress = accts[0] as `0x${string}`;
              setAddress(userAddress);
              fetchBalance(userAddress);
            }
          })
          .catch((err) => console.warn("Silent eth_accounts error:", err));
      }
    }
  }, [connectWallet]);

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
        isMobile,
        isInMetaMask,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
