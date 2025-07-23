import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PropsWithChildren } from "react";

import { basicConfig } from "@/config";

export const SolanaProvider = ({ children }: PropsWithChildren) => {
  return (
    <ConnectionProvider endpoint={basicConfig.solanaConfig.endpoint}>
      <WalletProvider
        wallets={basicConfig.solanaConfig.wallets}
        autoConnect={basicConfig.solanaConfig.autoConnect}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
