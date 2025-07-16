import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { queryClient, config } from "./evm-provider";
import { ConnectKitProvider } from "connectkit";

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
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider>
                <SolanaProvider>
                  <Theme>{children}</Theme>
                </SolanaProvider>
              </ConnectKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletSelectorContextProvider>
      </TonProvider>
    </>
  );
};
