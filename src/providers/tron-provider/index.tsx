import React, { useMemo } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import { WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import {
  WalletDisconnectedError,
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";
import "@tronweb3/tronwallet-adapter-react-ui/style.css";
import { TronWeb } from "tronweb";
import {
  TronLinkAdapter,
  TokenPocketAdapter,
  BitKeepAdapter,
  OkxWalletAdapter,
  GateWalletAdapter,
  BybitWalletAdapter,
  LedgerAdapter,
  WalletConnectAdapter,
} from "@tronweb3/tronwallet-adapters";

export const tronWeb = new TronWeb({
  fullHost: "https://api.nileex.io",
});

export function TronProvider({ children }: { children: React.ReactNode }) {
  function onError(e: WalletError) {
    if (e instanceof WalletNotFoundError) {
      // some alert for wallet not found
    } else if (e instanceof WalletDisconnectedError) {
      // some alert for wallet not connected
    } else {
      console.error(e.message);
    }
  }

  const adapters = useMemo(
    () => [
      new TronLinkAdapter(),
      new TokenPocketAdapter(),
      new BitKeepAdapter(),
      new OkxWalletAdapter(),
      new GateWalletAdapter(),
      new BybitWalletAdapter(),
      new LedgerAdapter(),
      new WalletConnectAdapter({
        network: "mainnet",
        options: {
          projectId: "bde78605c842813c95fe91c9b4ed1f92",
        },
        web3ModalConfig: {},
      }),
    ],
    []
  );

  return (
    <WalletProvider onError={onError} adapters={adapters}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
