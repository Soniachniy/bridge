import { QueryClient } from "@tanstack/react-query";

import { basicConfig } from "@/config";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
};
const solanaWeb3JsAdapter = new SolanaAdapter();

const metadata = {
  name: "HyperDep",
  description: "HyperDep",
  url: "https://bridge-lyart-three.vercel.app/",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const wagmiAdapter = new WagmiAdapter({
  networks: basicConfig.evmConfig.networks,
  projectId: basicConfig.evmConfig.projectId,
  ssr: true,
});

export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: basicConfig.evmConfig.networks,
  projectId: basicConfig.evmConfig.projectId,
  metadata,
  features: {
    analytics: true,
  },
});

export const queryClient = new QueryClient(queryClientConfig);
