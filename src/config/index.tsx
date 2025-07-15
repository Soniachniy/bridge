import { setupHotWallet } from "@hot-wallet/sdk/adapter/near";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { HotWalletAdapter } from "@hot-wallet/sdk/adapter/solana";
import { Adapter } from "@solana/wallet-adapter-base";
import { mainnet, sepolia } from "wagmi/chains";

export const oneClickConfig = {
  baseUrl: "https://1click.chaindefuser.com/v0",
};

// EVM Configuration
export const evmConfig = {
  chains: [mainnet, sepolia] as const,
  transports: {
    [mainnet.id]: "http",
    [sepolia.id]: "http",
  },
};

// Solana Configuration
export const solanaConfig = {
  endpoint:
    "https://mainnet.helius-rpc.com/?api-key=e5134d0c-9f20-48b6-ada5-33583b7f78fc",
  autoConnect: true,
  wallets: [
    () => new PhantomWalletAdapter() as Adapter,
    () => new HotWalletAdapter() as Adapter,
  ],
};

// NEAR Configuration
export const nearConfig = {
  network: "mainnet" as const,
  contractId: "",
  modules: [
    () => setupHotWallet(),
    () => setupMyNearWallet(),
    () => setupSender(),
  ],
  fallbackRpcUrls: [
    "https://rpc.mainnet.pagoda.co",
    "https://rpc.near.org",
    "https://rpc.mainnet.near.org",
  ],
};

// TON Configuration
export const tonConfig = {
  walletsListSource: "/wallets-v2.json",
  manifestUrl: "https://hapi-app.vercel.app/tonconnect-manifest.json",
};

// QueryClient Configuration
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
};

export enum Network {
  ARBITRUM = "ARBITRUM",
  AURORA = "AURORA",
  BASE = "BASE",
  BEREA = "BEREA",
  BNB = "BNB",
  BITCOIN = "BITCOIN",
  DOGE = "DOGE",
  ETHEREUM = "ETHEREUM",
  GNOSIS = "GNOSIS",
  NEAR = "NEAR",
  POLYGON = "POLYGON",
  SOLANA = "SOLANA",
  TON = "TON",
  TRON = "TRON",
  XRP = "XRP",
  ZEC = "ZEC",
}

export const networkAddresses = {
  [Network.ARBITRUM]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.ETHEREUM]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.SOLANA]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.TON]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.TRON]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.XRP]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.ZEC]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.NEAR]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
  [Network.POLYGON]: {
    bridge: "0x0000000000000000000000000000000000000000",
  },
};
