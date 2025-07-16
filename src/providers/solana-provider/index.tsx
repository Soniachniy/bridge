import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PropsWithChildren, useMemo } from "react";
import { solanaConfig } from "../../config";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export const SolanaProvider = ({ children }: PropsWithChildren) => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={solanaConfig.endpoint}>
      <WalletProvider wallets={wallets} autoConnect={solanaConfig.autoConnect}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
