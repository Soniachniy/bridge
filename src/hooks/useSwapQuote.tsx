import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { FormInterface } from "@/lib/validation";
import { getQuote } from "@/providers/proxy-provider";
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";

type Props = {
  tokenIn: TokenResponse | null;
  amountIn: string;
  setFormValue: (name: keyof FormInterface, value: string) => void;
  hyperliquidAddress: string | null;
  refundAddress: string | null;
  setError: (key: keyof FormInterface, value: {}) => void;
  clearError: (key: (keyof FormInterface)[]) => void;
  slippageValue: number;
};

const useSwapQuote = ({
  tokenIn,
  amountIn,
  setFormValue,
  hyperliquidAddress,
  refundAddress,
  setError,
  clearError,
  slippageValue,
}: Props) => {
  return useQuery({
    queryKey: [
      "quote",
      amountIn,
      hyperliquidAddress || "",
      refundAddress || "",
      tokenIn?.assetId,
    ],
    queryFn: async () => {
      if (!tokenIn) return null;
      try {
        const response = await getQuote(
          !hyperliquidAddress || !refundAddress,
          tokenIn.assetId,
          tokenIn.blockchain,
          slippageValue,
          hyperliquidAddress ?? "",
          parseTokenAmount(amountIn, tokenIn.decimals),
          refundAddress ?? ""
        );
        if (!response?.success) {
          const isAmountError = response?.error?.includes("Amount too small");
          if (isAmountError) {
            setError("amount", {
              message: response?.error || "Failed to fetch quote",
            });
            setFormValue("amountOut", "");
          } else if (response?.error?.includes("refundTo")) {
            setError("refundAddress", {
              message: response?.error || "Failed to fetch quote",
            });
          }
          return null;
        }
        if (response) {
          setFormValue(
            "amountOut",
            formatTokenAmount(response.data.expectedAmountOut, USDC_DECIMALS)
          );
          setFormValue("platformFee", response.data.fees.expectedPlatformFee);
          setFormValue("gasFee", response.data.fees.gasFee);
          if (Number(response.data.expectedAmountOut) > 0) {
            clearError(["amountOut"]);
          }

          if (response.data.depositAddress)
            setFormValue("depositAddress", response.data.depositAddress);
          if (Boolean(hyperliquidAddress)) {
            clearError(["hyperliquidAddress", "refundAddress"]);
          }
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
