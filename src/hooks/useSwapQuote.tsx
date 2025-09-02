import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRef } from "react";

import { FormInterface, MIN_AMOUNT } from "@/lib/validation";
import { getQuote } from "@/providers/proxy-provider";
import {
  formatTokenAmount,
  parseTokenAmount,
  removeTrailingZeros,
} from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";
import { useTokens } from "@/providers/token-context";
import Big from "big.js";
import { useNavigate } from "react-router-dom";

type Props = {
  tokenIn: TokenResponse | null;
  amountIn: string;
  setFormValue: (name: keyof FormInterface, value: string) => void;
  hyperliquidAddress: string | null;
  refundAddress: string | null;
  setError: (key: keyof FormInterface, value: {}) => void;
  clearError: (key: (keyof FormInterface)[]) => void;
  slippageValue: number;
  trigger: () => void;
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
  trigger,
}: Props) => {
  const tokens = useTokens();
  const navigate = useNavigate();
  const latestRequestRef = useRef<string>("");

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

      // Store the current request's amount
      const currentRequest = amountIn;
      latestRequestRef.current = currentRequest;

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

        // Only process the response if it's still the latest request
        if (latestRequestRef.current !== currentRequest) {
          return null; // Skip processing outdated responses
        }

        if (!response?.success) {
          const isAmountError = response?.error?.includes("Amount");
          if (isAmountError) {
            const token = tokens[tokenIn.assetId];
            if (response?.error?.includes("Amount too low") && token?.price) {
              const minAmount = removeTrailingZeros(
                Big(Math.round(MIN_AMOUNT / token.price)).toFixed(8)
              );

              setError("amount", {
                message: `Amount too small. Min amount is ${minAmount} ${token.symbol}`,
              });
            } else {
              setError("amount", {
                message: response?.error || "Failed to fetch quote",
              });
            }
          } else if (response?.error?.includes("refundTo")) {
            setError("refundAddress", {
              message: response?.error || "Failed to fetch quote",
            });
          }
          if (response?.error?.includes("Failed to get quote")) {
            setError("amountOut", {
              message: response?.error || "Failed to fetch quote",
            });
          }
          setFormValue("amountOut", "0");
          setFormValue("depositAddress", "");

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

          if (response.data.depositAddress) {
            setFormValue("depositAddress", response.data.depositAddress);
            navigate(`/${response.data.depositAddress}`);
          }
          if (Boolean(hyperliquidAddress)) {
            clearError(["amount", "hyperliquidAddress", "refundAddress"]);
            // Only trigger validation for the latest request
            trigger();
          }
        }
        return response;
      } catch (error: unknown) {
        // Only process errors for the latest request
        if (latestRequestRef.current === currentRequest) {
          if (isAxiosError(error)) {
            throw new Error(error.response?.data.message || "Invalid request");
          }
          throw error;
        }
        return null;
      }
    },
    staleTime: 0,
    retry: false,
  });
};

export default useSwapQuote;
