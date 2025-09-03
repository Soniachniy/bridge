import { formatTokenAmount, truncateAddress } from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";
import { CHAIN_ICON, CHAIN_TITLE, getTokenIcon } from "@/lib/1clickHelper";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import ArrowDown from "@/assets/chevron.svg?react";

import { useFormContext } from "react-hook-form";
import { FormInterface } from "@/lib/validation";
import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import LoadingIcon from "@/assets/loading-icon.svg?react";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/error-icon.svg?react";
import LinkIcon from "@/assets/link-icon.svg?react";
import { ActionButton } from "@/components/ActionButtons";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ServerStages, stageToStep } from "@/hooks/useProcessing";
import { useLocalStoreTimer } from "@/hooks/useLocalStoreTimer";

const stages = {
  [ServerStages.deposit_received]: {
    title: `Deposit detected on `,
    stepNumber: 1,
  },
  [ServerStages.processing]: {
    title: "Bridging and swapping to USDC on Arbitrum",
    stepNumber: 2,
  },
  [ServerStages.ready_for_permit]: {
    title: "Awaiting your signature to complete deposit",
    stepNumber: 3,
  },
  [ServerStages.executing_deposit]: {
    title: "Depositing into Hyperliquid",
    stepNumber: 4,
  },
  [ServerStages.completed]: {
    title: "Completed",
    stepNumber: 5,
  },
};

export enum IndicatorState {
  Empty = "Empty",
  Processing = "Processing",
  Success = "Success",
  Error = "Error",
}

const StatusIndicator = ({
  indicatorState,
}: {
  indicatorState: IndicatorState;
}) => {
  switch (indicatorState) {
    case IndicatorState.Processing:
      return <LoadingIcon className="animate-spin size-6" fill={"white"} />;
    case IndicatorState.Success:
      return <SuccessIcon className="size-6" />;
    case IndicatorState.Error:
      return <ErrorIcon className="size-6" />;
    case IndicatorState.Empty:
      return (
        <div className="size-6 relative border-2 border-white border-solid rounded-full" />
      );
  }
};

export const ProcessingView = ({
  signPermit,
  currentStage,
}: {
  signPermit: (depositAddress: string) => Promise<void>;
  currentStage: ServerStages;
}) => {
  const { watch } = useFormContext<FormInterface>();
  const [signPermitLoading, setSignPermitLoading] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const amountOut = watch("amountOut");
  const amountIn = watch("amount");
  const platformFee = watch("platformFee");
  const gasFee = watch("gasFee");
  const refundAddress = watch("refundAddress");
  const hyperliquidAddress = watch("hyperliquidAddress");
  const selectedToken = watch("selectedToken");
  const txHash = watch("txHash");

  const depositAddress = watch("depositAddress");
  const { timeLeftFormatted, timeLeft } = useLocalStoreTimer();

  return (
    <>
      <div className="flex flex-col gap-6 self-center inline-flex justify-between items-start bg-form rounded-4xl p-6 w-full md:w-[540px]">
        <div className="flex flex-col gap-2 w-full">
          <div className="self-stretch text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
            Your Transaction is on its Way
          </div>
          <div className="self-stretch text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-tight">
            Swapping & bridging {amountIn} {selectedToken?.symbol} → USDC on
            Arbitrum. <br />
            This may take a few minutes. Most steps are automatic, but at one
            point you'll need to sign a message to complete your deposit.
          </div>
        </div>
        <div className="self-stretch text-center justify-center">
          {timeLeft > 0 && (
            <>
              <span className="text-gray_text text-sm font-normal font-['Inter'] leading-none">
                Complete within:{" "}
              </span>
              <span className="text-white text-sm font-semibold font-['Inter'] leading-none">
                {timeLeftFormatted}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-8 px-10 w-full">
          {Object.entries(stages).map(([key, stage]) => {
            const currentStep = stageToStep(currentStage);
            const isPassed = currentStep > stage.stepNumber;
            const isCurrent = currentStep === stage.stepNumber;
            const isEmpty = currentStep < stage.stepNumber;
            const isLast = currentStep === 5;
            const currentState = isEmpty
              ? IndicatorState.Empty
              : isPassed
              ? IndicatorState.Success
              : isLast
              ? IndicatorState.Success
              : isCurrent
              ? IndicatorState.Processing
              : IndicatorState.Empty;

            if (key === ServerStages.deposit_received) {
              return (
                <div key={key}>
                  <div className="flex flex-row gap-2 items-center text-main_white text-base font-semibold font-['Inter']">
                    <StatusIndicator
                      indicatorState={
                        currentStep === 0
                          ? IndicatorState.Processing
                          : currentState
                      }
                    />
                    <div>
                      {stage.title}
                      {
                        CHAIN_TITLE[
                          selectedToken?.blockchain as TokenResponse.blockchain
                        ]
                      }
                    </div>
                  </div>
                </div>
              );
            }
            if (key === ServerStages.processing) {
              return (
                <div key={key}>
                  <div className="flex flex-row mb-4 gap-2 items-start text-main_white text-base font-semibold font-['Inter']">
                    <StatusIndicator indicatorState={currentState} />
                    <div>{stage.title}</div>
                  </div>

                  {txHash && (
                    <a
                      href={`https://arbiscan.io/tx/${txHash}`}
                      target="_blank"
                      className="flex flex-row pl-8 text-center justify-start text-main_light text-base font-semibold font-['Inter'] leading-normal"
                      rel="noopener noreferrer"
                    >
                      View on Explorer <LinkIcon className="size-6" />
                    </a>
                  )}
                </div>
              );
            }
            if (key === ServerStages.ready_for_permit) {
              return (
                <div key={key}>
                  <div className="flex flex-row gap-2 items-center text-main_white text-base font-semibold font-['Inter']">
                    <StatusIndicator indicatorState={currentState} />
                    <div>{stage.title}</div>
                  </div>
                  {isCurrent && (
                    <>
                      <ActionButton
                        className="mt-8"
                        variant="tertiary"
                        onClick={async () => {
                          setSignPermitLoading(true);
                          depositAddress && (await signPermit(depositAddress));
                          setSignPermitLoading(false);
                        }}
                        disabled={!depositAddress || signPermitLoading}
                      >
                        {!signPermitLoading ? (
                          <>Sign permit</>
                        ) : (
                          <LoadingIcon
                            className="animate-spin size-4"
                            fill={"#0F1A20"}
                          />
                        )}
                      </ActionButton>
                      <div className=" mt-4 flex flex-row items-center text-center  w-full justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
                        Please confirm the message in your wallet
                      </div>
                    </>
                  )}
                </div>
              );
            }
            return (
              <div key={stage.title}>
                <div className="flex flex-row gap-2 items-center text-main_white text-base font-semibold font-['Inter']">
                  <StatusIndicator indicatorState={currentState} />
                  <div>{stage.title}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="h-14 px-4 py-3 rounded-2xl inline-flex justify-center items-center gap-2 w-full cursor-pointer"
          onClick={() => setIsDetailsVisible(!isDetailsVisible)}
        >
          <div className="text-center justify-center text-main_light text-base font-semibold font-['Inter'] leading-normal">
            Transaction Details
          </div>
          <ArrowDown
            className={cn("size-3", isDetailsVisible ? "rotate-180" : "")}
            fill="#97FCE4"
          />
        </div>
        {isDetailsVisible && (
          <>
            <div className="gap-2 flex flex-row justify-between items-center w-full">
              {selectedToken && (
                <div className="relative flex flex-col outline rounded-3xl  outline-1 outline-offset-[-1px] outline-teal-200/10 flex-1 items-center justify-center p-6 gap-3">
                  <div className="flex flex-row gap-2 items-start">
                    <div className="relative flex  items-center">
                      <div className="size-10 flex items-center justify-center rounded-full bg-white">
                        <img
                          src={getTokenIcon(selectedToken)}
                          alt={selectedToken?.assetId ?? "token"}
                          className="size-8 rounded-full"
                        />
                      </div>

                      <img
                        src={CHAIN_ICON[selectedToken?.blockchain]}
                        alt={selectedToken?.blockchain ?? "blockchain"}
                        className="absolute size-4 bottom-0 right-0 border border-input-custom rounded-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2 items-start">
                      <p className="justify-center text-white text-base font-semibold font-['Inter'] leading-none">
                        {selectedToken?.symbol}
                      </p>
                      <p className="justify-center text-main_white text-xs font-normal opacity-60 font-['Inter'] leading-none">
                        {CHAIN_TITLE[selectedToken?.blockchain]}
                      </p>
                    </div>
                  </div>
                  <div className="self-stretch h-6 text-center justify-center text-main_white text-2xl font-semibold font-['Inter'] leading-normal">
                    {amountIn}
                  </div>
                </div>
              )}
              <ArrowDown className="rotate-270" fill="#97FCE4" />

              <div className="relative flex flex-col flex-1 rounded-3xl justify-center items-center outline outline-1 outline-offset-[-1px] outline-teal-200/10 p-6 gap-3">
                <div className="flex flex-row gap-2 items-start">
                  <div className="relative flex  items-center ">
                    <div className="size-10 flex items-center justify-center rounded-full bg-white">
                      <img
                        src={getTokenIcon({ symbol: "USDC" } as TokenResponse)}
                        alt={selectedToken?.assetId ?? "token"}
                        className="size-8 rounded-full"
                      />
                    </div>

                    <HyperliquidIcon className="absolute size-4 bottom-0 right-0 border border-input-custom rounded-full" />
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <p className="justify-center text-white text-base font-semibold font-['Inter'] leading-none">
                      USDC
                    </p>
                    <p className="justify-center text-main_white text-xs font-normal opacity-60 font-['Inter'] leading-none">
                      Hyperliquid
                    </p>
                  </div>
                </div>
                <div className="self-stretch h-6 text-center justify-center text-main_white text-2xl font-semibold font-['Inter'] leading-normal">
                  ≥{amountOut}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 px-4 w-full mt-4">
              <div className="flex flex-row justify-between w-full">
                <div className="justify-start text-gray_text text-sm font-normal font-['Inter'] leading-none">
                  Minimum received:
                </div>
                <div className="justify-start text-main_white text-sm font-semibold font-['Inter'] leading-none">
                  ≥{amountOut}
                </div>
              </div>
              <div className="flex flex-row justify-between w-full">
                <div className="justify-start text-gray_text text-sm font-normal font-['Inter'] leading-none">
                  Refund address:
                </div>
                <div className="justify-start text-white text-sm font-semibold font-['Inter'] leading-none">
                  {truncateAddress(refundAddress)}
                </div>
              </div>

              <div className="flex flex-row justify-between w-full">
                <div className="justify-start text-gray_text text-sm font-normal font-['Inter'] leading-none">
                  Hyperliquid address:
                </div>
                <div className="justify-start text-white text-sm font-semibold font-['Inter'] leading-none">
                  {truncateAddress(hyperliquidAddress)}
                </div>
              </div>

              <div className="flex flex-row justify-between w-full">
                <div className="justify-start text-gray_text text-sm font-normal font-['Inter'] leading-none">
                  Platform fee:
                </div>
                <div className="justify-start text-white text-sm font-semibold font-['Inter'] leading-none">
                  {formatTokenAmount(platformFee, USDC_DECIMALS)} USDC
                </div>
              </div>

              <div className="flex flex-row justify-between w-full">
                <div className="justify-start text-gray_text text-sm font-normal font-['Inter'] leading-none">
                  Gas fee:
                </div>
                <div className="justify-start text-white text-sm font-semibold font-['Inter'] leading-none">
                  {formatTokenAmount(gasFee, USDC_DECIMALS)} USDC
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
