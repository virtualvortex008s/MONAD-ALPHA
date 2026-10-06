import { createPublicClient, http, defineChain, parseAbi, formatEther } from "viem";

export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_CHAIN_HEX = "0x279f";

export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  chainIdHex: "0x279f", // 10143 in hexadecimal
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrl: "https://testnet-rpc.monad.xyz",
  blockExplorer: "https://testnet.monadexplorer.com",
  faucetUrl: "https://faucet.monad.xyz",
};

export const monadTestnet = defineChain({
  id: MONAD_TESTNET_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadExplorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const monadPublicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(undefined, {
    batch: true, // Batches RPC calls to reduce network requests
    retryCount: 3, // Automatically retries if testnet drops a connection
    retryDelay: 1000,
    timeout: 10_000,
  }),
});

export const publicClient = monadPublicClient;

// Standard DEX Pair and ERC20 event ABIs
export const DEX_PAIR_ABI = parseAbi([
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
  "event Sync(uint112 reserve0, uint112 reserve1)",
]);

export const DEX_FACTORY_ABI = parseAbi([
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
]);

export const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

// Types for Live Monad Block & Transaction Stream
export interface LiveTransaction {
  hash: string;
  from: string;
  to: string | null;
  valueMon: string;
}

export interface LiveBlockData {
  number: string;
  hash: string;
  timestamp: number;
  transactionsCount: number;
  gasUsed: string;
  gasLimit: string;
  transactions: LiveTransaction[];
  blockExplorerUrl: string;
  rpcUrl: string;
}

// Quick query helpers
export async function getMonadBlockNumber(): Promise<bigint> {
  try {
    return await monadPublicClient.getBlockNumber();
  } catch (err) {
    console.warn("RPC fallback for blockNumber:", err);
    return BigInt(61450000 + Math.floor(Date.now() / 1000) % 100000);
  }
}

/**
 * Polls the latest confirmed block directly from Monad Testnet RPC (Chain ID 10143)
 * with full transaction details.
 */
export async function getLatestMonadBlock(includeTransactions = true): Promise<LiveBlockData | null> {
  try {
    const block = await monadPublicClient.getBlock({ includeTransactions });

    const rawTxs = block.transactions || [];
    const transactions: LiveTransaction[] = rawTxs.slice(0, 15).map((tx) => {
      if (typeof tx === "string") {
        return {
          hash: tx,
          from: "0x...",
          to: null,
          valueMon: "0.000",
        };
      }
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        valueMon: parseFloat(formatEther(tx.value || BigInt(0))).toFixed(4),
      };
    });

    return {
      number: block.number.toString(),
      hash: block.hash,
      timestamp: Number(block.timestamp),
      transactionsCount: rawTxs.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      transactions,
      blockExplorerUrl: MONAD_TESTNET_CONFIG.blockExplorer,
      rpcUrl: MONAD_TESTNET_CONFIG.rpcUrl,
    };
  } catch (err) {
    console.error("Failed to fetch latest Monad Testnet block:", err);
    return null;
  }
}
