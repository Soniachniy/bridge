import { createContext, useContext } from "react";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { fetchTokens } from "./proxy-provider";

export const TokenContext = createContext<{
  tokens?: { [key: string]: TokenResponse };
}>({
  tokens: undefined,
});

export const TokenContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: tokensData } = useQuery({
    queryKey: ["tokens"],
    queryFn: () => fetchTokens(),
    select: (data) => {
      return data.reduce((acc, token) => {
        acc[token.assetId] = token;
        return acc;
      }, {} as { [key: string]: TokenResponse });
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchInterval: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <TokenContext.Provider value={{ tokens: tokensData }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const { tokens } = useContext(TokenContext);
  return tokens ?? {};
};
