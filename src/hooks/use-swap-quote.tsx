import {
  OneClickService,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { parseUnits } from "viem";

import { OneClickSwapFormValues } from "@/lib/1clickHelper";

type Props = {
  tokenIn: TokenResponse;
  amountIn: string;
  setFormValue: (name: keyof OneClickSwapFormValues, value: string) => void;
  recipient: string | null;
  slippage: string;
  refundAddress: string;
};

const useSwapQuote = ({
  tokenIn,
  amountIn,
  setFormValue,
  recipient,
  slippage,
  refundAddress,
}: Props) => {
  return useQuery<QuoteResponse | null>({
    queryKey: ["quote", amountIn, recipient, tokenIn.assetId, slippage],
    queryFn: async () => {
      try {
        const response = await OneClickService.getQuote({
          dry: !recipient,
          swapType: QuoteRequest.swapType.EXACT_INPUT,
          slippageTolerance: Number(slippage) * 100,
          originAsset: tokenIn.assetId,
          depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
          destinationAsset:
            "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
          amount: parseUnits(amountIn, tokenIn.decimals).toString(),
          refundTo:
            refundAddress || "0xd6bd5ba5e9fc6a6db3c023dcd5b12ddb062655d4",
          refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
          recipient: recipient || "0xd6bd5ba5e9fc6a6db3c023dcd5b12ddb062655d4", //SHOULD BE CHANGED
          recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
          referral: "referral",
          deadline: new Date(Date.now() + 600 * 1000).toISOString(),
          quoteWaitingTimeMs: 5000,
        });
        if (response) {
          setFormValue("amountOut", response.quote.amountOutFormatted);
          if (response.quote.depositAddress)
            setFormValue("depositAddress", response.quote.depositAddress);
        }
        return response;
      } catch (error) {
        if (isAxiosError(error)) {
          throw new Error(error.response?.data.message || "Invalid request");
        }
        throw error;
      }
    },
    staleTime: 0,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.quoteRequest?.quoteWaitingTimeMs) {
        return data.quoteRequest.quoteWaitingTimeMs;
      }
      return false;
    },
  });
};

export default useSwapQuote;
