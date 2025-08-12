import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { queryClient, wagmiAdapter } from "./evm-provider";

import { WalletSelectorContextProvider } from "./near-provider";
import { SolanaProvider } from "./solana-provider";
import { TonProvider } from "./ton-provider";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { BridgeFormMachineProvider } from "@/providers/machine-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TonProvider>
        <WalletSelectorContextProvider>
          <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <SolanaProvider>
                <BridgeFormMachineProvider>
                  <Theme>{children}</Theme>
                </BridgeFormMachineProvider>
              </SolanaProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletSelectorContextProvider>
      </TonProvider>
    </>
  );
};
