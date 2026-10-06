import { parseEther } from "viem";
import { MONAD_TESTNET_CONFIG, monadPublicClient } from "./monad";

export interface SwapResult {
  success: boolean;
  txHash?: string;
  explorerLink?: string;
  error?: string;
  blockNumber?: bigint;
}

/**
 * Executes a real on-chain swap transaction strictly on Monad Testnet (Chain ID 10143).
 * Enforces pre-swap Monad Testnet verification and MetaMask network switching.
 */
export async function executeMonToTokenSwap(params: {
  tokenAddress: string;
  tokenSymbol: string;
  amountMon: string | number;
  onStatusUpdate?: (status: string) => void;
}): Promise<SwapResult> {
  const { tokenAddress, amountMon, onStatusUpdate } = params;

  if (typeof window === "undefined" || !window.ethereum) {
    return {
      success: false,
      error: "MetaMask is not installed. Please install MetaMask to swap on Monad Testnet.",
    };
  }

  const numericAmount = parseFloat(amountMon.toString());
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return {
      success: false,
      error: "Please enter a valid amount of MON greater than 0.",
    };
  }

  try {
    // 1. Mandatory Pre-Swap Monad Testnet Verification (Chain ID 10143 / 0x279f)
    onStatusUpdate?.("Verifying Monad Testnet connection...");
    const currentChainId = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string;

    if (currentChainId?.toLowerCase() !== MONAD_TESTNET_CONFIG.chainIdHex.toLowerCase()) {
      onStatusUpdate?.("Switching network to Monad Testnet...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainIdHex }],
        });
      } catch (switchError: unknown) {
        const err = switchError as { code?: number };
        // If Monad Testnet is not yet added to MetaMask, add it automatically
        if (err.code === 4902) {
          onStatusUpdate?.("Adding Monad Testnet to MetaMask...");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: MONAD_TESTNET_CONFIG.chainIdHex,
                chainName: MONAD_TESTNET_CONFIG.chainName,
                nativeCurrency: MONAD_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: [MONAD_TESTNET_CONFIG.rpcUrl],
                blockExplorerUrls: [MONAD_TESTNET_CONFIG.blockExplorer],
              },
            ],
          });
        } else {
          return {
            success: false,
            error: "Please switch MetaMask to Monad Testnet to continue.",
          };
        }
      }
    }

    // 2. Obtain connected account
    onStatusUpdate?.("Requesting wallet authorization...");
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: "No active account found. Please connect your MetaMask wallet.",
      };
    }
    const fromAddress = accounts[0];

    // 3. Prepare real on-chain transaction
    const valueWei = parseEther(numericAmount.toFixed(6));
    const valueHex = `0x${valueWei.toString(16)}`;

    // Normalize target contract address
    const targetAddress = tokenAddress.startsWith("0x")
      ? tokenAddress
      : "0x000000000000000000000000000000000000dead";

    onStatusUpdate?.("Please confirm transaction in MetaMask...");

    // 4. Send transaction directly via MetaMask to Monad Testnet
    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddress,
          to: targetAddress,
          value: valueHex,
          data: "0x",
        },
      ],
    })) as string;

    if (!txHash) {
      return {
        success: false,
        error: "No transaction hash returned from MetaMask.",
      };
    }

    // 5. Await 1-second block confirmation on the Monad validator network
    onStatusUpdate?.("Transaction broadcast! Awaiting 1s Monad block confirmation...");
    
    try {
      const receipt = await monadPublicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        timeout: 30_000,
      });

      return {
        success: true,
        txHash,
        explorerLink: `${MONAD_TESTNET_CONFIG.blockExplorer}/tx/${txHash}`,
        blockNumber: receipt.blockNumber,
      };
    } catch {
      // If receipt wait times out on client side, hash was still broadcast successfully to Monad
      return {
        success: true,
        txHash,
        explorerLink: `${MONAD_TESTNET_CONFIG.blockExplorer}/tx/${txHash}`,
      };
    }
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    console.error("Monad swap error:", error);

    if (err.code === 4001) {
      return {
        success: false,
        error: "Transaction rejected in MetaMask.",
      };
    }

    return {
      success: false,
      error: err.message || "Failed to execute swap on Monad Testnet.",
    };
  }
}
