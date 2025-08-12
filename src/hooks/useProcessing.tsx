import { delay } from "@/lib/1clickHelper";
import { ProcessingStages } from "@/pages/ProcessingScreen";
import { wagmiAdapter } from "@/providers/evm-provider";
import { execute, getPermitData, getStatus } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sliceHex } from "viem";
import { signTypedData, switchChain } from "@wagmi/core";

const translateStatus = (status: string) => {
  switch (status) {
    case "pending_deposit":
      return ProcessingStages.Initial;
    case "deposit_received":
      return ProcessingStages.DepositReceived;
    case "processing":
      return ProcessingStages.Processing;
    case "executing_deposit":
      return ProcessingStages.ExecutingDeposit;
    case "completed":
      return ProcessingStages.Completed;
    case "ready_for_permit":
      return ProcessingStages.ReadyForPermit;
    case "incomplete_deposit":
      return ProcessingStages.IncompleteDeposit;
    case "refunded":
      return ProcessingStages.Refunded;
    case "failed":
      return ProcessingStages.Failed;
    case "deposit_failed":
      return ProcessingStages.DepositFailed;
    case "unknown":
      return ProcessingStages.Unknown;
    default:
      return ProcessingStages.Initial;
  }
};

export default function useProcessing(depositAddressParam?: string | null) {
  const tokens = useTokens();
  const { id: depositAddressFromParams } = useParams();
  const depositAddress = depositAddressParam || depositAddressFromParams;
  const [stage, setStage] = useState<ProcessingStages>(
    ProcessingStages.Initial
  );
  const [initialData, setInitialData] = useState<{
    selectedToken: TokenResponse;
    amountIn: bigint;
    amountOut: bigint;
    depositAddress: string;
  } | null>(null);

  const [isPermitAsked, setIsPermitAsked] = useState(false);

  const signPermit = async (depositAddress: string) => {
    const permitData = await getPermitData(depositAddress);
    const { message, types, domain } = permitData.data;

    await switchChain(wagmiAdapter.wagmiConfig, {
      chainId: Number(domain.chainId),
    });
    const signature = await signTypedData(wagmiAdapter.wagmiConfig, {
      account: message.owner as `0x${string}`,
      types,
      primaryType: "Permit",
      domain: {
        name: domain.name,
        version: domain.version,
        chainId: BigInt(domain.chainId),
        verifyingContract: domain.verifyingContract as `0x${string}`,
      },
      message: {
        owner: message.owner as `0x${string}`,
        spender: message.spender as `0x${string}`,
        value: BigInt(message.value),
        nonce: BigInt(message.nonce),
        deadline: BigInt(message.deadline),
      },
    });
    setStage(ProcessingStages.ExecutingDeposit);
    if (signature) {
      const r = sliceHex(signature, 0, 32);
      const s = sliceHex(signature, 32, 64);
      const vByte = sliceHex(signature, 64, 65);
      const v = parseInt(vByte, 16);

      await execute(depositAddress, {
        v: v,
        r: r,
        s: s,
      });
    }
  };

  useEffect(() => {
    const startPolling = async () => {
      try {
        if (depositAddress) {
          await getDepositStatus(depositAddress);
        }
      } catch (e) {
        setStage(ProcessingStages.Failed);
      }
    };
    const getDepositStatus = async (depositAddress: string, retries = 40) => {
      const timeInterval = 7000;
      const maxRetries = retries;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          await delay(timeInterval);
          const statusResponse = await getStatus(depositAddress);

          if (!initialData?.selectedToken) {
            const selectedToken = tokens?.[statusResponse.data.assetFrom];
            if (selectedToken) {
              setInitialData({
                selectedToken: {
                  assetId: statusResponse.data.assetFrom,
                  blockchain: selectedToken?.blockchain,
                  decimals: selectedToken?.decimals,
                  price: selectedToken?.price ?? 0,
                  priceUpdatedAt: selectedToken?.priceUpdatedAt ?? "0",
                  symbol: selectedToken?.symbol,
                },
                amountIn: statusResponse.data.amountIn,
                amountOut: statusResponse.data.minAmountOut,
                depositAddress: statusResponse.data.depositAddress,
              });
            }
          }

          setStage(translateStatus(statusResponse.data.status));
          if (statusResponse.data.status === "completed") {
            return;
          }
        } catch (error) {
          console.error(`Error: while getting status\n\n`, error);
        }

        attempt++;
      }
    };
    startPolling();
  }, [depositAddress, tokens]);

  useEffect(() => {
    const processPermit = async () => {
      if (depositAddress) {
        if (stage === ProcessingStages.ReadyForPermit) {
          if (!isPermitAsked) {
            setIsPermitAsked(true);
            await signPermit(depositAddress);
          }
        }
      }
    };
    processPermit();
  }, [stage, depositAddress]);
  return {
    stage,
    initialData,
    signPermit,
  };
}
