import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { queryClient, wagmiAdapter } from "./evm-provider";

import { WalletSelectorContextProvider } from "./near-provider";
import { SolanaProvider } from "./solana-provider";
import { TonProvider } from "./ton-provider";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TonProvider>
        <WalletSelectorContextProvider>
          <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <SolanaProvider>
                <Theme>{children}</Theme>
              </SolanaProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletSelectorContextProvider>
      </TonProvider>
    </>
  );
};
