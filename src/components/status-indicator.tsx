import { ProcessingStages } from "@/lib/states";
import { cn } from "@/lib/utils";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/error-icon.svg?react";
import WarningIcon from "@/assets/warning-icon.svg?react";

export enum IndicatorState {
  Empty = "Empty",
  Filled = "Filled",
  Processing = "Processing",
  Success = "Success",
  Error = "Error",
  Warning = "Warning",
}

export const stages = {
  [ProcessingStages.Initial]: {
    stepNumber: 1,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.AssetSelection]: {
    stepNumber: 1,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.WalletConnection]: {
    stepNumber: 2,
    title: "Connect Wallet",
    description: "Connect your wallet to proceed with the deposit",
  },
  [ProcessingStages.DetailsReview]: {
    stepNumber: 3,
    title: "Confirm your deposit",
    description:
      "Review your details and optionally set a refund address.23h 59m to complete the deposit.",
  },
  [ProcessingStages.Processing]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Processing,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.UserPermit]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Warning,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.ErrorScreen]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Error,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.ExecutingDeposit]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Processing,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.SignErrorScreen]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Warning,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.SuccessScreen]: {
    stepNumber: 5,
    indicatorState: IndicatorState.Success,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.SwapErrorScreen]: {
    stepNumber: 5,
    indicatorState: IndicatorState.Error,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
  [ProcessingStages.ManualDepositErrorScreen]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Error,
    title: "Choose Asset and Set Amount",
    description:
      "Select the chain, token and amount you want to deposit to Hyperliquid Perps",
  },
};

const StatusIndicator = ({
  indicatorState,
  stepNumber,
}: {
  indicatorState: IndicatorState;
  stepNumber: number;
}) => {
  switch (indicatorState) {
    case IndicatorState.Empty:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-element text-[#7e8385]"
          )}
        >
          {stepNumber}
        </div>
      );
    case IndicatorState.Filled:
    case IndicatorState.Processing:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-main_light text-black"
          )}
        >
          {stepNumber}
        </div>
      );

    case IndicatorState.Success:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-main_light text-black"
          )}
        >
          <SuccessIcon stroke={"black"} opacity={"1"} />
        </div>
      );
    case IndicatorState.Error:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-error text-black"
          )}
        >
          <ErrorIcon />
        </div>
      );
    case IndicatorState.Warning:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-warning text-black"
          )}
        >
          <WarningIcon />
        </div>
      );
  }
};

export const Status = ({ localStage }: { localStage: ProcessingStages }) => {
  const successStage = Object.values(stages).reduce((acc, stage) => {
    if (!acc[stage.stepNumber]) {
      acc[stage.stepNumber] = stage;
    }
    return acc;
  }, {} as Record<number, { stepNumber: number; title: string; description: string; indicatorState?: IndicatorState }>);
  const currentStage = stages[localStage];
  return (
    <div>
      <div className="mb-4 flex flex-row text-center justify-center items-center text-main_white text-2xl font-normal font-['Inter'] leading-normal">
        {Object.values(successStage).map(
          ({ stepNumber, indicatorState }, index) => {
            const isFirst = index === 0;
            console.log("currentStage", currentStage, stepNumber);
            const secondaryIndicatorState =
              currentStage.stepNumber < stepNumber
                ? IndicatorState.Empty
                : IndicatorState.Filled;
            return (
              <div
                key={stepNumber}
                className="flex flex-row justify-center items-center"
              >
                {!isFirst && (
                  <div
                    className={cn(
                      "w-[70px] h-[2px] bg-main_light",
                      currentStage.stepNumber < stepNumber - 1
                        ? "bg-element"
                        : "bg-main_light"
                    )}
                  />
                )}
                <StatusIndicator
                  indicatorState={
                    secondaryIndicatorState === IndicatorState.Empty
                      ? IndicatorState.Empty
                      : indicatorState ?? secondaryIndicatorState
                  }
                  stepNumber={stepNumber}
                />
              </div>
            );
          }
        )}
      </div>

      <div className="mt-4 text-center justify-start text-main_white text-2xl font-normal font-['Inter'] leading-normal">
        {currentStage.title}
      </div>
      <div className="mb-8 justify-start text-main_white text-xs text-center font-normal font-['Inter'] leading-none">
        {currentStage.description}
      </div>
    </div>
  );
};
