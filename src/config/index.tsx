import { setupHotWallet } from "@hot-wallet/sdk/adapter/near";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
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
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

export enum Network {
  ARBITRUM = "arb",
  AURORA = "aur",
  BASE = "base",
  BERA = "bera",
  BNB = "bnb",
  BITCOIN = "btc",
  DOGE = "doge",
  ETHEREUM = "eth",
  GNOSIS = "gnosis",
  NEAR = "near",
  POLYGON = "polygon",
  SOLANA = "sol",
  TON = "ton",
  TRON = "tron",
  XRP = "xrp",
  ZEC = "zec",
}

export const supportedNetworks = {
  [Network.ETHEREUM]: true,
  [Network.SOLANA]: true,
  [Network.NEAR]: true,
  [Network.TON]: true,
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

export const networkChainId = {
  [Network.ETHEREUM]: mainnet.id,
  [Network.POLYGON]: polygon.id,
  [Network.ARBITRUM]: arbitrum.id,
  [Network.AURORA]: aurora.id,
  [Network.BASE]: base.id,
  [Network.BERA]: berachain.id,
  [Network.BNB]: bsc.id,
  [Network.GNOSIS]: gnosis.id,
  [Network.TRON]: tron.id,
  [Network.SOLANA]: null,
  [Network.NEAR]: null,
  [Network.TON]: null,
  [Network.DOGE]: null,
  [Network.BITCOIN]: null,
  [Network.XRP]: null,
  [Network.ZEC]: null,
};

export const getNetworkChainId = (network: TokenResponse.blockchain) => {
  return networkChainId[translateTokenToNetwork(network)];
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
    manifestUrl: "https://hyperdep.now/tonconnect-manifest.json",
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
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

// Local translation to avoid circular import with `@/lib/1clickHelper`
export const translateTokenToNetwork = (
  blockchain: TokenResponse.blockchain
): Network => {
  switch (blockchain) {
    case TokenResponse.blockchain.ARB:
      return Network.ARBITRUM;
    case TokenResponse.blockchain.ETH:
      return Network.ETHEREUM;
    case TokenResponse.blockchain.NEAR:
      return Network.NEAR;
    case TokenResponse.blockchain.ZEC:
      return Network.ZEC;
    case TokenResponse.blockchain.BTC:
      return Network.BITCOIN;
    case TokenResponse.blockchain.SOL:
      return Network.SOLANA;
    case TokenResponse.blockchain.DOGE:
      return Network.DOGE;
    case TokenResponse.blockchain.XRP:
      return Network.XRP;
    case TokenResponse.blockchain.GNOSIS:
      return Network.GNOSIS;
    case TokenResponse.blockchain.BERA:
      return Network.BERA;
    case TokenResponse.blockchain.BASE:
      return Network.BASE;
    case TokenResponse.blockchain.TRON:
      return Network.TRON;
    case TokenResponse.blockchain.TON:
      return Network.TON;
    case TokenResponse.blockchain.POL:
      return Network.POLYGON;
    default:
      return Network.ARBITRUM;
  }
};
