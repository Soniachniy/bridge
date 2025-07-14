import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PropsWithChildren, useMemo } from "react";
import { solanaConfig } from "../../config";

export const SolanaProvider = ({ children }: PropsWithChildren) => {
  const wallets = useMemo(
    () => solanaConfig.wallets.map((walletFactory) => walletFactory()),
    []
  );

  return (
    <ConnectionProvider endpoint={solanaConfig.endpoint}>
      <WalletProvider wallets={wallets} autoConnect={solanaConfig.autoConnect}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
