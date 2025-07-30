import { getDepositStatus } from "@/lib/1clickHelper";
import { wagmiAdapter } from "@/providers/evm-provider";
import { execute, getPermitData } from "@/providers/proxy-provider";
import { signTypedData, switchChain } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { sliceHex } from "viem";

export enum ProcessingStages {
  DepositReceived = "deposit_received",
  Processing = "processing",
  ReadyForPermit = "ready_for_permit",
  ExecutingDeposit = "executing_deposit",
  Completed = "completed",
  Failed = "failed",
}

export default function ProcessingScreen() {
  const { id: depositAddress } = useParams();
  const [stage, setStage] = useState<ProcessingStages>(
    ProcessingStages.DepositReceived
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const executeManualDeposit = async () => {
      try {
        if (depositAddress) {
          const depositStatus = await getDepositStatus(depositAddress);
          if (depositStatus.status) {
            setStage(ProcessingStages.Processing);
            const permitData = await getPermitData(depositAddress);
            console.log(permitData, "permitData");
            setStage(ProcessingStages.ReadyForPermit);
            const { message, types, domain } = permitData.data;
            await switchChain(wagmiAdapter.wagmiConfig, {
              chainId: Number(domain.chainId),
            });

            const signature = await signTypedData(wagmiAdapter.wagmiConfig, {
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

              const proccess = await execute(depositAddress, {
                v: v,
                r: r,
                s: s,
              });
              if (proccess.success) {
                setStage(ProcessingStages.Completed);
              } else {
                setStage(ProcessingStages.Failed);
              }
            }
          }
        }
      } catch (e) {
        setError(e as string);
        setStage(ProcessingStages.Failed);
      }
    };
    executeManualDeposit();
  }, [depositAddress]);

  switch (stage) {
    case ProcessingStages.DepositReceived:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Deposit Received
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            Your deposit is on its way. Swap and bridge will begin shortly.
          </div>
        </div>
      );
    case ProcessingStages.Processing:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Processing
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            We’re processing your swap and bridge now.
          </div>
        </div>
      );
    case ProcessingStages.ReadyForPermit:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Ready for permit
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            Action required: please sign the message to complete your gasless
            deposit.
          </div>
        </div>
      );
    case ProcessingStages.ExecutingDeposit:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Executing deposit
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            Depositing your funds into Hyperliquid. Please wait…
          </div>
        </div>
      );
    case ProcessingStages.Completed:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Completed
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            Success! Your funds have arrived in your Hyperliquid account.
          </div>
        </div>
      );
    case ProcessingStages.Failed:
      return (
        <div className="m-auto w-[470px] inline-flex flex-col justify-start items-center gap-4">
          <div className="text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
            Swap failed
          </div>
          <div className="justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
            Oops! The swap didn’t go through. Please contact support for help.
            Deposit address: {depositAddress}. Error: {error}
          </div>
        </div>
      );
  }
}
