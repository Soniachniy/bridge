import { setupHotWallet } from "@hot-wallet/sdk/adapter/near";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { HotWalletAdapter } from "@hot-wallet/sdk/adapter/solana";
import { Adapter } from "@solana/wallet-adapter-base";
import { WalletModuleFactory } from "@near-wallet-selector/core";
import { BrowserWallet } from "@near-wallet-selector/core";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  AppKitNetwork,
  base,
  aurora,
  polygon,
  bsc,
  berachain,
  tron,
  gnosis,
} from "@reown/appkit/networks";

export enum Network {
  ARBITRUM = "ARBITRUM",
  AURORA = "AURORA",
  BASE = "BASE",
  BERA = "BERA",
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

export const supportedNetworks = {
  [Network.ETHEREUM]: true,
  [Network.SOLANA]: true,
  [Network.NEAR]: true,
  [Network.TON]: false,
  [Network.POLYGON]: true,
  [Network.ARBITRUM]: true,
  [Network.AURORA]: true,
  [Network.BASE]: true,
  [Network.BERA]: true,
  [Network.BNB]: true,
  [Network.BITCOIN]: false,
  [Network.DOGE]: false,
  [Network.GNOSIS]: false,
  [Network.TRON]: false,
  [Network.XRP]: false,
  [Network.ZEC]: false,
};

export const basicConfig = {
  arbitrumProxyAddress: "0xbafa6bb00cc1bdf9e8ecd549f0261bafbdfb1c2a",
  proxyApiPoint: "https://api.hyperdep.now",
  nearConfig: {
    network: "mainnet" as const,
    contractId: "",
    modules: [
      setupHotWallet() as WalletModuleFactory<BrowserWallet>,
      setupMyNearWallet(),
      setupSender(),
    ],
  },
  evmConfig: {
    projectId: "2c00d113200749f27e7e970776874f1c",
    adapters: [WagmiAdapter],
    networks: [
      mainnet,
      arbitrum,
      base,
      aurora,
      polygon,
      bsc,
      berachain,
      tron,
      gnosis,
    ] as [AppKitNetwork, ...AppKitNetwork[]],
  },
  tonConfig: {
    manifestUrl:
      "https://bridge-lyart-three.vercel.app/tonconnect-manifest.json",
  },
  solanaConfig: {
    endpoint:
      "https://mainnet.helius-rpc.com/?api-key=e5134d0c-9f20-48b6-ada5-33583b7f78fc",
    autoConnect: true,
    wallets: [
      new HotWalletAdapter() as Adapter,
      new PhantomWalletAdapter() as Adapter,
    ],
  },
};
