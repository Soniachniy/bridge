import { delay } from "@/lib/1clickHelper";

import { wagmiAdapter } from "@/providers/evm-provider";
import { execute, getPermitData, getStatus } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sliceHex } from "viem";
import { signTypedData, switchChain } from "@wagmi/core";
import { ProcessingStages } from "@/lib/states";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

export const translateStatus = (status: string) => {
  switch (status) {
    case "pending_deposit":
      return ProcessingStages.AwaitingDeposit;
    case "deposit_received":
      return ProcessingStages.Processing;
    case "processing":
      return ProcessingStages.Processing;
    case "ready_for_permit":
      return ProcessingStages.UserPermit;
    case "executing_deposit":
      return ProcessingStages.ExecutingDeposit;
    case "completed":
      return ProcessingStages.SuccessScreen;
    case "incomplete_deposit":
      return ProcessingStages.ManualDepositErrorScreen;
    case "failed":
      return ProcessingStages.ErrorScreen;
    case "deposit_failed":
      return ProcessingStages.ErrorScreen;
    default:
      return ProcessingStages.ErrorScreen;
  }
};

const redirectToStage = (stage: ProcessingStages) => {
  switch (stage) {
    case ProcessingStages.AwaitingDeposit:
      return "awaiting_deposit";
    case ProcessingStages.Processing:
      return "start_processing";
    case ProcessingStages.UserPermit:
      return "sign_permit";
    case ProcessingStages.ExecutingDeposit:
      return "signed";
    case ProcessingStages.SuccessScreen:
      return "success";
    case ProcessingStages.ErrorScreen:
      return "swap_error";
    case ProcessingStages.ManualDepositErrorScreen:
      return "manual_deposit_error";
    default:
      return;
  }
};

export default function useProcessing(depositAddressParam?: string | null) {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const tokens = useTokens();
  const { id: depositAddressFromParams } = useParams();
  const depositAddress = depositAddressParam || depositAddressFromParams;

  const [isPermitAsked, setIsPermitAsked] = useState(false);
  const view = BridgeFormMachineContext.useSelector((s) => s.value);

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
    actorRef.send({ type: "signed" });
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
        actorRef.send({ type: "error" });
      }
    };
    const getDepositStatus = async (depositAddress: string, retries = 80) => {
      const timeInterval = 7000;
      const maxRetries = retries;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          await delay(timeInterval);
          const statusResponse = await getStatus(depositAddress);

          const stage = translateStatus(statusResponse.data.status);
          if (stage !== view) {
            const newView = redirectToStage(stage);
            if (newView) {
              actorRef.send({ type: newView });
            }
          }

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
        if (view === ProcessingStages.UserPermit) {
          if (!isPermitAsked) {
            setIsPermitAsked(true);
            await signPermit(depositAddress);
          }
        }
      }
    };
    processPermit();
  }, [view, depositAddress]);

  return {
    signPermit,
  };
}
