import { isNativeToken, translateNetwork } from "@/lib/1clickHelper";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { TonApiClient } from "@ton-api/client";
import {
  createTonClient,
  createTransferMessage,
  getUserJettonWalletAddress,
} from "./tonJettonService";
import { basicConfig } from "@/config";

export interface SendTransactionTonParams {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
}

export const tonClient = new TonApiClient({
  baseUrl: "https://tonapi.io",
  baseApiParams: {
    headers: {
      Authorization: `Bearer AGJ6LLDZTHT774IAAAACH7HUVRAYFMQL4SK3FC3ET2FRNLGHFGOOV7U5V4K6BFOGJ6OPLUQ`,
      "Content-type": "application/json",
    },
  },
});

export async function createDepositTonTransaction(
  userWalletAddress: string,
  depositAddress: string,
  amount: bigint,
  selectedToken: TokenResponse
): Promise<SendTransactionTonParams | null> {
  if (
    selectedToken.blockchain !== "ton" ||
    !selectedToken.blockchain ||
    !selectedToken.contractAddress
  )
    return null;

  if (
    isNativeToken(
      translateNetwork(selectedToken.blockchain),
      selectedToken.assetId
    )
  ) {
    return createDepositTonNativeTransaction(depositAddress, amount);
  }

  return await createDepositTonJettonTransaction(
    userWalletAddress,
    depositAddress,
    amount,
    selectedToken.contractAddress
  );
}

export function createDepositTonNativeTransaction(
  depositAddress: string,
  amount: bigint
): SendTransactionTonParams {
  return {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address: depositAddress,
        amount: amount.toString(),
      },
    ],
  };
}

export async function createDepositTonJettonTransaction(
  userWalletAddress: string,
  depositAddress: string,
  amount: bigint,
  jettonMasterAddress: string
): Promise<SendTransactionTonParams> {
  const userJettonWalletAddress = await getUserJettonWalletAddress(
    createTonClient(basicConfig.tonConfig.endpoint),
    userWalletAddress,
    jettonMasterAddress
  );
  const transferMessagePayload = createTransferMessage(
    amount,
    depositAddress,
    userWalletAddress
  );

  return {
    validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes from now
    messages: [
      {
        address: userJettonWalletAddress,
        amount: "80000000", // 0.08 TON to cover gas fees
        payload: transferMessagePayload,
      },
    ],
  };
}
