import { wagmiAdapter } from "@/providers/evm-provider";
import { execute, getPermitData, getStatus } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { sliceHex } from "viem";
import { signTypedData, switchChain } from "@wagmi/core";
import { ProcessingStages } from "@/lib/states";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

export enum ServerStages {
  idle = "idle",
  pending_deposit = "pending_deposit",
  deposit_received = "deposit_received",
  ready_for_permit = "ready_for_permit",
  executing_deposit = "executing_deposit",
  processing = "processing",
  completed = "completed",
  failed = "failed",
  deposit_failed = "deposit_failed",
}

export const stageToStep = (stage: ServerStages) => {
  switch (stage) {
    case ServerStages.pending_deposit:
      return 0;
    case ServerStages.deposit_received:
      return 1;
    case ServerStages.processing:
      return 2;
    case ServerStages.ready_for_permit:
      return 3;
    case ServerStages.executing_deposit:
      return 4;
    case ServerStages.completed:
      return 5;
    case ServerStages.failed:
      return 5;
    case ServerStages.deposit_failed:
      return 5;
    default:
      return 0;
  }
};

export const getNextView = (status: ServerStages) => {
  switch (status) {
    case "pending_deposit":
      return ProcessingStages.Processing;
    case "deposit_received":
      return ProcessingStages.Processing;
    case "processing":
      return ProcessingStages.Processing;
    case "completed":
      return ProcessingStages.SuccessScreen;
    case "failed":
      return ProcessingStages.ErrorScreen;
    case "deposit_failed":
      return ProcessingStages.ErrorScreen;
    default:
      return;
  }
};

export default function useProcessing(depositAddressParam?: string | null) {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStage, setCurrentStage] = useState<ServerStages>(
    depositAddressParam ? ServerStages.pending_deposit : ServerStages.idle
  );

  const tokens = useTokens();
  const { id: depositAddressFromParams } = useParams();
  const depositAddress = depositAddressParam || depositAddressFromParams;

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

    const getDepositStatus = async (depositAddress: string) => {
      try {
        const statusResponse = await getStatus(depositAddress);
        setCurrentStage(statusResponse.data.status);

        if (statusResponse.data.status === "processing") {
          actorRef.send({ type: "start_processing" });
        }

        if (statusResponse.data.status === "completed") {
          actorRef.send({ type: "success" });

          return;
        }
      } catch (error) {
        console.error(`Error: while getting status\n\n`, error);
      }
    };
    if (currentStage !== ServerStages.idle) {
      intervalRef.current = setInterval(startPolling, 7000);
    }
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [depositAddress, tokens, currentStage]);

  useEffect(() => {
    if (depositAddress && currentStage === ServerStages.idle) {
      setCurrentStage(ServerStages.pending_deposit);
    }

    const processPermit = async () => {
      if (depositAddress) {
        if (currentStage === ServerStages.ready_for_permit) {
          if (!isPermitAsked) {
            setIsPermitAsked(true);
            await signPermit(depositAddress);
          }
        }
      }
    };
    processPermit();
  }, [depositAddress, currentStage]);

  return {
    currentStage,
    signPermit,
  };
}
