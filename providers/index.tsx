import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { queryClient, config } from "./evm-provider";

import { WalletSelectorContextProvider } from "./near-provider";
import { SolanaProvider } from "./solana-provider";
import { TonProvider } from "./ton-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TonProvider>
        <WalletSelectorContextProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <SolanaProvider>{children}</SolanaProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletSelectorContextProvider>
      </TonProvider>
    </>
  );
};
