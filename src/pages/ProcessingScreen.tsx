import { ActionButton } from "@/components/ActionButtons";
import { CHAIN_ICON, CHAIN_TITLE, getTokenIcon } from "@/lib/1clickHelper";
import { USDC_DECIMALS } from "@/lib/constants";
import { cn, formatTokenAmount } from "@/lib/utils";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useCallback } from "react";

import SuccessIcon from "@/assets/success-icon-transparent.svg?react";

import useProcessing from "@/hooks/useProcessing";

export enum ProcessingStages {
  Initial = "initial",
  DepositReceived = "deposit_received",
  Processing = "processing",
  ReadyForPermit = "ready_for_permit",
  ExecutingDeposit = "executing_deposit",
  Completed = "completed",
  Failed = "failed",
  IncompleteDeposit = "incomplete_deposit",
  Refunded = "refunded",
  DepositFailed = "deposit_failed",
  Unknown = "unknown",
}

export const stages = {
  [ProcessingStages.Initial]: {
    number: 0,
    status: false,
    title: "Awaiting deposit",
    description:
      "Your transaction is on its way. Please confirm within the next 23h 55m to complete the process.",
    stage: ProcessingStages.Initial,
  },
  [ProcessingStages.DepositReceived]: {
    number: 1,
    status: true,
    title: "Deposit Received",
    description:
      "Your deposit is on its way. Swap and bridge will begin shortly.",
    stage: ProcessingStages.DepositReceived,
  },
  [ProcessingStages.Processing]: {
    number: 2,
    status: true,
    title: "Processing",
    description: "We’re processing your swap and bridge now.",
    stage: ProcessingStages.Processing,
  },
  [ProcessingStages.ReadyForPermit]: {
    number: 3,
    status: true,
    title: "Ready for Permit",
    description:
      "Action required: please sign the message to complete your gasless deposit.",
    stage: ProcessingStages.ReadyForPermit,
  },
  [ProcessingStages.ExecutingDeposit]: {
    number: 4,
    status: true,
    title: "Executing Deposit",
    description: "Depositing your funds into Hyperliquid. Please wait…",
    stage: ProcessingStages.ExecutingDeposit,
  },
  [ProcessingStages.Completed]: {
    number: 5,
    status: true,
    title: "Completed",
    description:
      "Success! Your funds have arrived in your Hyperliquid account.",
    stage: ProcessingStages.Completed,
  },
  [ProcessingStages.Failed]: {
    number: 6,
    status: false,
    title: "Failed",
    description:
      "Oops! The swap didn’t go through. Please contact support for help.",
    stage: ProcessingStages.Failed,
  },
  [ProcessingStages.IncompleteDeposit]: {
    number: 7,
    status: false,
    title: "Incomplete Deposit",
    description: "Your deposit is incomplete. Please contact support for help.",
    stage: ProcessingStages.IncompleteDeposit,
  },
  [ProcessingStages.Refunded]: {
    number: 8,
    status: false,
    title: "Refunded",
    description:
      "Your deposit has been refunded. Please contact support for help.",
    stage: ProcessingStages.Refunded,
  },
  [ProcessingStages.DepositFailed]: {
    number: 9,
    status: false,
    title: "Deposit Failed",
    description: "Your deposit has failed. Please contact support for help.",
    stage: ProcessingStages.DepositFailed,
  },
  [ProcessingStages.Unknown]: {
    number: 10,
    status: false,
    title: "Unknown",
    description: "Unknown error. Please contact support for help.",
    stage: ProcessingStages.Unknown,
  },
};

export const BasicInfo = ({
  stage,
  initialData,
}: {
  stage: ProcessingStages;
  initialData?: {
    selectedToken: TokenResponse;
    amountIn: bigint;
    amountOut: bigint;
    depositAddress: string;
  } | null;
}) => {
  const handleCopyAddress = useCallback(async () => {
    if (initialData?.depositAddress) {
      try {
        await navigator.clipboard.writeText(initialData.depositAddress);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  }, [initialData?.depositAddress]);

  if (!initialData) {
    return null;
  }
  return (
    <div className="m-auto p-4 flex flex-col gap-2 justify-center align-center w-full md:w-[480px]">
      <div className="text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
        From
      </div>
      <div className="flex flex-row gap-6 border min-h-[75px] border-element rounded-lg p-2 px-4">
        <div className="relative h-[55px] flex items-center">
          <img
            src={getTokenIcon(initialData?.selectedToken)}
            alt={initialData?.selectedToken?.assetId ?? "token"}
            className="size-12 rounded-full"
          />
          <img
            src={CHAIN_ICON[initialData?.selectedToken?.blockchain]}
            alt={initialData?.selectedToken?.blockchain ?? "blockchain"}
            className="absolute size-4 -bottom-1 -right-1 border border-white rounded-full"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between py-2">
          <p className="text-left  text-main_white text-base font-semibold font-['Inter'] leading-normal">
            {initialData?.selectedToken?.symbol}
          </p>
          <p className="text-left text-main_white text-xs font-normal font-['Inter'] leading-none">
            {CHAIN_TITLE[initialData?.selectedToken?.blockchain]}
          </p>
        </div>
      </div>
      <div className="mt-4 text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
        Amount
      </div>
      <div className="flex flex-col gap-2 border min-h-[75px] border-element rounded-lg p-2 px-4">
        <div className="flex grow-1 flex-row items-center gap-7">
          <span
            className={`text-white grow-1 border-none outline-none text-2xl font-light bg-transparent font-inter leading-none`}
          >
            {formatTokenAmount(
              initialData?.amountIn,
              initialData?.selectedToken?.decimals
            )}
          </span>
        </div>
        <div className="flex flex-row gap-1 justify-between">
          <span className="text-white text-xs font-light font-inter leading-[14px]">
            <span className="text-white text-xs font-light font-inter leading-[14px]">
              At least $
              {formatTokenAmount(initialData?.amountOut, USDC_DECIMALS)} USDC
            </span>
          </span>
        </div>
      </div>
      <div className="mt-4 text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
        Deposit address
      </div>
      <div className="flex flex-col gap-2 border border-element rounded-lg p-2 px-4">
        <div className="flex grow-1 flex-row items-center gap-7">
          <span
            className={`text-white grow-1 border-none whitespace-nowrap overflow-hidden text-ellipsis outline-none text-main_white text-sm font-light bg-transparent font-inter leading-none`}
          >
            {initialData?.depositAddress}
          </span>
          {stage === ProcessingStages.DepositReceived && (
            <button
              onClick={handleCopyAddress}
              className=" text-xs text-center font-normal font-['Inter'] leading-normal cursor-pointer bg-main_light rounded-md px-2 py-1"
            >
              Copy
            </button>
          )}
        </div>
      </div>
      <ActionButton variant="primary" className="mt-4">
        Support
      </ActionButton>
      <span className="text-main_white text-xs text-center font-normal font-['Inter'] leading-normal">
        Go back to use HyperDep and deposit more assets.
      </span>
    </div>
  );
};

export const Status = ({ localStage }: { localStage: ProcessingStages }) => {
  const successStage = Object.values(stages).filter((stage) => stage.status);
  const currentStage = stages[localStage];
  return (
    <div>
      {currentStage.status && (
        <div className=" flex flex-row text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
          {successStage.map(({ number }, index) => {
            const isLast = index === successStage.length - 1;
            const isFirst = index === 0;
            return (
              <div className="flex flex-row justify-center items-center">
                {!isFirst && (
                  <div
                    className={cn(
                      "w-[70px] h-[2px] bg-main_light",
                      currentStage.number < number
                        ? "bg-element"
                        : "bg-main_light"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
                    currentStage.number < number
                      ? "bg-element text-[#7e8385]"
                      : "bg-main_light text-black"
                  )}
                  key={number}
                >
                  {isLast ? (
                    <SuccessIcon
                      stroke={currentStage.number >= number ? "black" : "white"}
                      opacity={currentStage.number >= number ? "1" : "0.4"}
                    />
                  ) : (
                    number
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className=" mt-4 text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
        {currentStage.title}
      </div>
      <div className="justify-start text-main_white text-xs text-center font-normal font-['Inter'] leading-none">
        {currentStage.description}
      </div>
    </div>
  );
};

export default function ProcessingScreen() {
  const { stage, initialData } = useProcessing();
  return (
    <div className="m-auto w-full lg:w-[470px] inline-flex flex-col justify-start items-center gap-4">
      <Status localStage={stage} />
      <BasicInfo stage={stage} initialData={initialData} />
    </div>
  );
}
