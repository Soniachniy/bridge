import {
  OneClickService,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { basicConfig } from "@/config";

export const SLIPPAGE = 50;

export const API_ROUTES = {
  QUOTE: basicConfig.proxyApiPoint + "/api/quote",
  STATUS: basicConfig.proxyApiPoint + "/api/status/",
  GET_PERMIT: basicConfig.proxyApiPoint + "/api/permit-data/",
  EXECUTE: basicConfig.proxyApiPoint + "/api/permit",
};

export const fetchTokens = async (): Promise<TokenResponse[]> => {
  try {
    return await OneClickService.getTokens();
  } catch (error) {
    console.error(error);
    return [];
  }
};

interface QuoteResponse {
  success: boolean;
  data: {
    depositAddress: string;
    expectedAmountOut: string;
    minAmountOut: string;
    expiresAt: string;
    recipient: string;
    refundTo: string;
  };
}

export const getQuote = async (
  dryRun: boolean,
  assetFrom: string,
  blockchain: string,
  hyperliquidAddress?: string,
  amount?: string,
  refundTo?: string
): Promise<QuoteResponse | null> => {
  if (dryRun) {
    const response = await fetch(API_ROUTES.QUOTE, {
      method: "POST",
      body: JSON.stringify({
        assetFrom,
        blockchain,
        slippageTolerance: SLIPPAGE,
      }),
    });
    return response.json();
  } else if (!hyperliquidAddress || !amount || !refundTo) {
    throw new Error("Invalid request");
  }
  const response = await fetch(API_ROUTES.QUOTE, {
    method: "POST",
    body: JSON.stringify({
      assetFrom,
      blockchain,
      slippageTolerance: SLIPPAGE,
      hyperliquidAddress,
      amount,
      refundTo,
    }),
  });
  return response.json();
};

export const getStatus = async (depositAddress: string) => {
  return await fetch(API_ROUTES.STATUS + depositAddress);
};

export const getPermitData = async (depositAddress: string) => {
  return await fetch(API_ROUTES.GET_PERMIT + depositAddress);
};

export const execute = async (
  depositAddress: string,
  userPermit: {
    v: number;
    r: string;
    s: string;
  }
) => {
  return await fetch(API_ROUTES.EXECUTE, {
    method: "POST",
    body: JSON.stringify({
      depositAddress,
      userPermit,
    }),
  });
};
