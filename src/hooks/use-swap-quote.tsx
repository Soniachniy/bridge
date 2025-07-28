import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { FormInterface } from "@/lib/validation";
import { getQuote } from "@/providers/proxy-provider";

type Props = {
  tokenIn: TokenResponse | null;
  amountIn: string;
  setFormValue: (name: keyof FormInterface, value: string) => void;
  hyperliquidAddress: string | undefined;
  refundAddress: string;
};

const useSwapQuote = ({
  tokenIn,
  amountIn,
  setFormValue,
  hyperliquidAddress,
  refundAddress,
}: Props) => {
  return useQuery({
    queryKey: ["quote", amountIn, hyperliquidAddress, tokenIn?.assetId],
    queryFn: async () => {
      if (!tokenIn) return null;
      try {
        const response = await getQuote(
          !hyperliquidAddress,
          tokenIn.assetId,
          tokenIn.blockchain,
          hyperliquidAddress,
          amountIn,
          refundAddress
        );
        if (response) {
          setFormValue("amountOut", response.data.expectedAmountOut);
          if (response.data.depositAddress)
            setFormValue("depositAddress", response.data.depositAddress);
        }
        return response;
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          throw new Error(error.response?.data.message || "Invalid request");
        }
        throw error;
      }
    },
    staleTime: 0,
    retry: false,
  });
};

export default useSwapQuote;
