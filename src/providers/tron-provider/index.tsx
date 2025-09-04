import React, { useMemo } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import { WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import {
  WalletDisconnectedError,
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters";
import { TronWeb } from "tronweb";

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

  const adapter = useMemo(() => new TronLinkAdapter(), []);

  return (
    <WalletProvider onError={onError} adapters={[adapter]}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
}
