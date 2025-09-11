import { FormInterface } from "@/lib/validation";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import useNetwork from "@/hooks/useNetworkHandler";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { basicConfig, Network, translateTokenToNetwork } from "@/config";
import { tonClient } from "@/providers/ton-provider/ton-utils";
import { Address } from "@ton/core";
import { Big } from "big.js";
import { RESERVED_NEAR_BALANCE } from "@/lib/constants";

export const useTokenBalance = () => {
  const { watch, setValue } = useFormContext<FormInterface>();
  const selectedToken = watch("selectedToken");
  const refundAddress = watch("refundAddress");
  const { getBalance } = useNetwork(null);

  const { isLoading } = useQuery({
    queryKey: [
      "token-balance",
      selectedToken?.assetId ?? "",
      refundAddress ?? "",
    ],
    queryFn: async () => {
      try {
        if (
          selectedToken &&
          selectedToken.balanceUpdatedAt === 0 &&
          refundAddress
        ) {
          const { balance, nearBalance } = await getBalance(
            selectedToken.assetId,
            selectedToken.contractAddress,
            selectedToken.blockchain
          );

          if (balance) {
            setValue("selectedToken", {
              ...selectedToken,
              balance: balance,
              balanceNear: nearBalance,
              balanceUpdatedAt: Date.now(),
            });
          }
        }
      } catch (e) {
        console.log(e, "error while getting balance");
      }
      return 0;
    },
    staleTime: 0,
  });
  return { isLoading };
};

const fetchBalance = async (
  network: TokenResponse.blockchain | undefined,
  address: string
): Promise<{ [key: string]: string }> => {
  if (!network) {
    return {};
  }
  const currentNetwork = translateTokenToNetwork(network);
  try {
    switch (currentNetwork) {
      case Network.NEAR: {
        const res: {
          accountId: string;
          state: { balance: string };
          tokens: {
            balance: string;
            contract_id: string;
            last_update_block_height: number;
          }[];
        } = await fetch(`https://api.fastnear.com/v1/account/${address}/full`, {
          method: "GET",
        }).then((res) => res.json());

        return {
          ...res.tokens.reduce((acc, token) => {
            if (token.contract_id === "wrap.near") {
              acc[token.contract_id] = Big(token.balance)
                .add(Big(res.state.balance))
                .minus(RESERVED_NEAR_BALANCE.toString())
                .toString();
            } else {
              acc[token.contract_id] = token.balance;
            }
            return acc;
          }, {} as { [key: string]: string }),
          [Network.NEAR]: res.state.balance,
        };
      }
      case Network.SOLANA: {
        const heliusOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: `{"jsonrpc":"2.0","id":"1","method":"getTokenAccounts","params":{"owner":"${address}"}}`,
        };
        const url = "https://mainnet.helius-rpc.com/";
        const options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: `{"jsonrpc":"2.0","id":"1","method":"getBalance","params":["${address}"]}`,
        };

        const response = await fetch(url, options).then((res) => res.json());

        const heliusResponse = await fetch(
          basicConfig.solanaConfig.endpoint,
          heliusOptions
        ).then((res) => res.json());

        return {
          ...heliusResponse.result.token_accounts.reduce(
            (
              acc: { [key: string]: string },
              token: { mint: string; amount: string }
            ) => {
              acc[token.mint] = token.amount;
              return acc;
            },
            {} as { [key: string]: string }
          ),
          [Network.SOLANA]: response.result.value,
        };
      }
      case Network.TON: {
        const tonResponse = await tonClient.accounts.getAccountJettonsBalances(
          Address.parse(address)
        );
        const tonBalance = await tonClient.accounts.getAccount(
          Address.parse(address)
        );
        return {
          ...tonResponse.balances.reduce((acc, token) => {
            acc[token.jetton.address.toString()] = token.balance.toString();
            return acc;
          }, {} as { [key: string]: string }),
          [Network.TON]: tonBalance.balance.toString(),
        };
      }
      case Network.ARBITRUM:
      case Network.AURORA:
      case Network.BASE:
      case Network.BNB:
      case Network.POLYGON:
      case Network.OP:
      case Network.AVAX:
      case Network.ETHEREUM: {
        const balance = await fetch(
          `${basicConfig.balancesApiPoint}/balances?address=${address}`,
          { method: "GET" }
        );
        const data = await balance.json();

        return data.networks.reduce((acc: any, item: any) => {
          return {
            ...acc,
            ...item.assets.reduce((acc: any, asset: any) => {
              const contractId = asset.contractId ?? item.network;
              acc[contractId] = asset.amount;
              return acc;
            }, {} as { [key: string]: string }),
          };
        }, {} as { [key: string]: string });
      }
      case Network.TRON: {
        const url = `https://apilist.tronscanapi.com/api/account/tokens?address=${address}&start=0&limit=20&hidden=0&show=0&sortType=0&sortBy=0`;
        const balance = await fetch(url, {
          method: "GET",
          headers: {
            "TRON-PRO-API-KEY": basicConfig.tronConfig.key,
          },
        });
        const data = await balance.json();

        return {
          ...data.data.reduce((acc: any, item: any) => {
            const contractId =
              item.tokenId === "_" ? Network.TRON : item.tokenId;
            return {
              ...acc,
              [contractId]: item.balance,
            };
          }, {} as { [key: string]: string }),
        };
      }
      default:
        return {};
    }
  } catch (e) {
    console.log(e, "error while getting balance");
    return {};
  }
};

export const useTokenBalanceByNetwork = (
  address: string,
  network: TokenResponse.blockchain | undefined
) => {
  return useQuery({
    queryKey: ["token-balance-by-network", network, address],
    queryFn: () => {
      return fetchBalance(network, address);
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
