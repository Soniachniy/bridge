import { setupHotWallet } from "@hot-wallet/sdk/adapter/near";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { HotWalletAdapter } from "@hot-wallet/sdk/adapter/solana";
import { Adapter } from "@solana/wallet-adapter-base";
import { mainnet, sepolia } from "wagmi/chains";
import { TonConnect } from "@tonconnect/ui-react";

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
  endpoint: "https://mainnet.helius-rpc.com/?api-key=e5134d0c-9f20-48b6-ada5-33583b7f78fc",
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
