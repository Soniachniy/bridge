import { QueryClient } from "@tanstack/react-query";

import { basicConfig } from "@/config";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import "@hot-wallet/sdk/adapter/evm";
import { metaMask } from "wagmi/connectors";

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
};

const metadata = {
  name: "HyperDep",
  description: "HyperDep",
  url: "https://hyperdep.now/",
  icons: ["https://hyperdep.now/logo.svg"],
};

export const wagmiAdapter = new WagmiAdapter({
  networks: basicConfig.evmConfig.networks,
  projectId: basicConfig.evmConfig.projectId,
  connectors: [metaMask()],
  ssr: true,
});

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: basicConfig.evmConfig.networks,
  projectId: basicConfig.evmConfig.projectId,
  metadata,
  features: {
    analytics: true,
  },
});

export const queryClient = new QueryClient(queryClientConfig);
