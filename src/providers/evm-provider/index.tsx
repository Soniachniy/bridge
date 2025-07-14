import { QueryClient } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import { evmConfig, queryClientConfig } from "../../config";

export const config = createConfig({
  chains: evmConfig.chains,
  transports: {
    [evmConfig.chains[0].id]: http(),
    [evmConfig.chains[1].id]: http(),
  },
});

export const queryClient = new QueryClient(queryClientConfig);
