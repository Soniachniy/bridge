import {
  OneClickService,
  TokenResponse,
} from "@defuse-protocol/one-click-sdk-typescript";
import { basicConfig } from "@/config";

export const API_ROUTES = {
  QUOTE: basicConfig.proxyApiPoint + "/api/quote",
  STATUS: basicConfig.proxyApiPoint + "/api/status/",
  GET_PERMIT: basicConfig.proxyApiPoint + "/api/permit-data/",
  EXECUTE: basicConfig.proxyApiPoint + "/api/permit",
  HISTORY: basicConfig.proxyApiPoint + "/api/transactions",
};

export const fetchTokens = async (): Promise<TokenResponse[]> => {
  try {
    const tokens = await OneClickService.getTokens();
    return tokens;
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
    fees: {
      expectedPlatformFee: string;
      gasFee: string;
    };
  };
  error?: string;
}

export interface PermitDataResponse {
  success: boolean;
  data: {
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    };
    types: {
      Permit: [
        { name: "owner"; type: "address" },
        { name: "spender"; type: "address" },
        { name: "value"; type: "uint256" },
        { name: "nonce"; type: "uint256" },
        { name: "deadline"; type: "uint256" }
      ];
    };
    message: {
      owner: string;
      spender: string;
      value: string;
      nonce: string;
      deadline: number;
    };
    depositAddress: string;
    finalAmount: string;
  };
}

export const getHistory = async (
  hyperliquidAddress: string
): Promise<HistoryResponse> => {
  const response = await fetch(
    API_ROUTES.HISTORY +
      "?hyperliquidAddress=" +
      hyperliquidAddress +
      "&hide=pending_deposit"
  );
  return response.json();
};

export interface HistoryTransaction {
  depositAddress: string;
  assetFrom: string;
  amountIn: string;
  amountOut: string;
  status: string;
  oneClickStatus: string;
  finalAmount: string;
  finalTxHash: string;
  errorMessage: string | null;
  fees: {
    expectedPlatformFee: string;
    finalPlatformFee: string;
    gasFee: string;
    platformFeePercentage: number;
    platformFeeMin: string;
    platformFeeMax: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    quoteExpiresAt: string;
  };
  needsPermit: boolean;
  canRetry: boolean;
  hyperliquidAddress: string;
  refundTo: string | null;
  isCompleted: boolean;
  isFailed: boolean;
}

export interface HistoryResponse {
  success: boolean;
  data: {
    hyperliquidAddress: string;
    totalTransactions: number;
    transactions: HistoryTransaction[];
  };
}

export const getQuote = async (
  dryRun: boolean,
  assetFrom: string,
  blockchain: string,
  slippageTolerance: number,
  hyperliquidAddress?: string,
  amount?: string,
  refundTo?: string
): Promise<QuoteResponse | null> => {
  if (dryRun) {
    const response = await fetch(API_ROUTES.QUOTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assetFrom,
        blockchain,
        slippageTolerance,
        amount,
      }),
    });
    return response.json();
  } else if (!hyperliquidAddress || !amount || !refundTo) {
    throw new Error("Invalid request");
  }
  const response = await fetch(API_ROUTES.QUOTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assetFrom,
      blockchain,
      slippageTolerance,
      hyperliquidAddress,
      amount,
      refundTo,
    }),
  });
  return response.json();
};

export const getStatus = async (depositAddress: string) => {
  const response = await fetch(API_ROUTES.STATUS + depositAddress);
  return response.json();
};

export const getPermitData = async (
  depositAddress: string
): Promise<PermitDataResponse> => {
  const response = await fetch(API_ROUTES.GET_PERMIT + depositAddress);
  return response.json();
};

export const execute = async (
  depositAddress: string,
  userPermit: {
    v: number;
    r: string;
    s: string;
  }
) => {
  const response = await fetch(API_ROUTES.EXECUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depositAddress,
      userPermit,
    }),
  });
  return response.json();
};
