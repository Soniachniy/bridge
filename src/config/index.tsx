import { setupHotWallet } from '@hot-wallet/sdk/adapter/near';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { HotWalletAdapter } from '@hot-wallet/sdk/adapter/solana';
import { setupArepaWallet } from '@near-wallet-selector/arepa-wallet';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { setupIntearWallet } from '@near-wallet-selector/intear-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMeteorWalletApp } from '@near-wallet-selector/meteor-wallet-app';
import { setupNarwallets } from '@near-wallet-selector/narwallets';

import { setupNightly } from '@near-wallet-selector/nightly';
import { setupOKXWallet } from '@near-wallet-selector/okx-wallet';
import { setupRamperWallet } from '@near-wallet-selector/ramper-wallet';
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
import { setupXDEFI } from '@near-wallet-selector/xdefi';
import { WalletModuleFactory } from '@near-wallet-selector/core';
import { BrowserWallet } from '@near-wallet-selector/core';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  mainnet,
  arbitrum,
  AppKitNetwork,
  base,
  aurora,
  polygon,
  bsc,
  berachain,
  optimism,
  avalanche,
  tron,
  gnosis,
} from '@reown/appkit/networks';
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript';

export enum Network {
  ARBITRUM = 'arb',
  AURORA = 'aur',
  STELLAR = 'stellar',
  APTOS = 'aptos',
  BASE = 'base',
  BERA = 'bera',
  BNB = 'bnb',
  BITCOIN = 'btc',
  DOGE = 'doge',
  ETHEREUM = 'eth',
  GNOSIS = 'gnosis',
  NEAR = 'near',
  POLYGON = 'polygon',
  SOLANA = 'sol',
  TON = 'ton',
  TRON = 'tron',
  XRP = 'xrp',
  ZEC = 'zec',
  SUI = 'sui',
  CARDANO = 'cardano',
  OP = 'op',
  AVAX = 'avax',
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
  [Network.TRON]: true,
  [Network.XRP]: false,
  [Network.ZEC]: false,
  [Network.SUI]: false,
  [Network.CARDANO]: false,
  [Network.OP]: true,
  [Network.AVAX]: true,
  [Network.STELLAR]: true,
  [Network.APTOS]: false,
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
  [Network.TRON]: null,
  [Network.SOLANA]: null,
  [Network.NEAR]: null,
  [Network.TON]: null,
  [Network.DOGE]: null,
  [Network.BITCOIN]: null,
  [Network.XRP]: null,
  [Network.ZEC]: null,
  [Network.SUI]: null,
  [Network.CARDANO]: null,
  [Network.OP]: optimism.id,
  [Network.AVAX]: avalanche.id,
  [Network.STELLAR]: null,
  [Network.APTOS]: null,
};

export const getNetworkChainId = (network: TokenResponse.blockchain) => {
  return networkChainId[translateTokenToNetwork(network)];
};

export const basicConfig = {
  arbitrumProxyAddress: '0xbafa6bb00cc1bdf9e8ecd549f0261bafbdfb1c2a',
  proxyApiPoint: 'https://api.hyperdep.now',
  balancesApiPoint: 'https://balances.hyperdep.now',
  nearConfig: {
    network: 'mainnet' as const,
    contractId: '',
    modules: [
      setupHotWallet() as WalletModuleFactory<BrowserWallet>,
      setupMyNearWallet() as WalletModuleFactory<BrowserWallet>,
      setupSender() as WalletModuleFactory<BrowserWallet>,
      setupArepaWallet() as WalletModuleFactory<BrowserWallet>,
      setupBitteWallet() as WalletModuleFactory<BrowserWallet>,
      setupCoin98Wallet() as WalletModuleFactory<BrowserWallet>,
      setupIntearWallet() as WalletModuleFactory<BrowserWallet>,
      setupLedger() as WalletModuleFactory<BrowserWallet>,
      setupMathWallet() as WalletModuleFactory<BrowserWallet>,
      setupMeteorWallet() as WalletModuleFactory<BrowserWallet>,
      setupMeteorWalletApp({
        contractId: '',
      }) as WalletModuleFactory<BrowserWallet>,
      setupNarwallets() as WalletModuleFactory<BrowserWallet>,
      setupNightly() as WalletModuleFactory<BrowserWallet>,
      setupOKXWallet() as WalletModuleFactory<BrowserWallet>,
      setupRamperWallet() as WalletModuleFactory<BrowserWallet>,
      setupWalletConnect({
        projectId: 'bde78605c842813c95fe91c9b4ed1f92',
        metadata: {
          name: 'Hyperdep',
          description: 'Hyperdep',
          url: 'https://hyperdep.now',
          icons: ['https://hyperdep.now/logo.png'],
        },
      }) as WalletModuleFactory<BrowserWallet>,
      setupWelldoneWallet() as WalletModuleFactory<BrowserWallet>,
      setupXDEFI() as WalletModuleFactory<BrowserWallet>,
    ],
  },
  evmConfig: {
    projectId: 'bde78605c842813c95fe91c9b4ed1f92',
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
      optimism,
      avalanche,
    ] as [AppKitNetwork, ...AppKitNetwork[]],
  },
  tonConfig: {
    manifestUrl: 'https://hyperdep.now/tonconnect-manifest.json',
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  },
  solanaConfig: {
    endpoint:
      'https://mainnet.helius-rpc.com/?api-key=e5134d0c-9f20-48b6-ada5-33583b7f78fc',
    autoConnect: true,
    wallets: [new HotWalletAdapter(), new PhantomWalletAdapter()],
  },
  tronConfig: {
    key: '4a1aebe1-bed8-46bd-9026-9f9408aa8f3f',
    endpoint: 'https://apilist.tronscan.org/api',
  },
  stellarConfig: {
    horizonUrl: 'https://horizon.stellar.org',
  },
};

// Local translation to avoid circular import with `@/lib/1clickHelper`
export const translateTokenToNetwork = (
  blockchain: TokenResponse.blockchain,
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
    case TokenResponse.blockchain.SUI:
      return Network.SUI;
    case TokenResponse.blockchain.OP:
      return Network.OP;
    case TokenResponse.blockchain.AVAX:
      return Network.AVAX;
    default:
      return Network.ARBITRUM;
  }
};
