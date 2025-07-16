import { QueryClient } from "@tanstack/react-query";

import { queryClientConfig } from "../../config";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, solana } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";

export const projectId = "2c00d113200749f27e7e970776874f1c";

const solanaWeb3JsAdapter = new SolanaAdapter();

// 2. Create a metadata object - optional
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://example.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Set the networks
const networks = [mainnet, arbitrum];

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: [mainnet, arbitrum, solana],
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export const queryClient = new QueryClient(queryClientConfig);
