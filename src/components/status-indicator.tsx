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
  [ProcessingStages.AssetSelection]: {
    stepNumber: 1,
    title: "Start a deposit",
    description: "",
  },
  [ProcessingStages.ManualDeposit]: {
    stepNumber: 2,
    title: "Send your deposit manually",
    description:
      "Review your details and optionally set a refund address. 24 hours to complete the deposit.",
  },
  [ProcessingStages.DetailsReview]: {
    stepNumber: 2,
    title: "Confirm your deposit",
    description:
      "Review your details and optionally set a refund address. 24 hours to complete the deposit.",
  },
  [ProcessingStages.AwaitingDeposit]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Processing,
    title: "Awaiting deposit",
    description:
      "Review your details and optionally set a refund address. 24 hours to complete the deposit.",
  },
  [ProcessingStages.Processing]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Processing,
    title: "Processing your deposit",
    description: "We are processing your deposit. This may take a few minutes.",
  },
  [ProcessingStages.UserPermit]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Warning,
    title: "Ready for permit",
    description:
      "Action required: please sign the message to complete your gasless deposit.",
  },
  [ProcessingStages.ErrorScreen]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Error,
    title: "Error",
    description: "Oops! Something went wrong. Please contact support for help.",
  },
  [ProcessingStages.ExecutingDeposit]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Processing,
    title: "Executing deposit",
    description: "Depositing your funds into Hyperliquid. Please wait…",
  },
  [ProcessingStages.SignErrorScreen]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Warning,
    title: "Sign error",
    description:
      "Please sign the message to complete your gasless deposit. Check the account to be the same as the one you used to connect.",
  },
  [ProcessingStages.ManualDepositErrorScreen]: {
    stepNumber: 3,
    indicatorState: IndicatorState.Error,
    title: "Partially deposited",
    description: "You should review your deposit amount.",
  },
  [ProcessingStages.SuccessScreen]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Success,
    title: "Completed",
    description:
      "Success! Your funds have arrived in your Hyperliquid account.",
  },
  [ProcessingStages.SwapErrorScreen]: {
    stepNumber: 4,
    indicatorState: IndicatorState.Error,
    title: "Swap failed",
    description:
      "Oops! The swap didn’t go through. Please contact support for help.",
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
    case IndicatorState.Processing:
      return (
        <div
          className={cn(
            "flex text-center border-1 border-background border-solid justify-center items-center rounded-full w-6 h-6 text-xs font-normal font-['Inter'] leading-normal",
            "bg-element text-black"
          )}
        >
          <div className="loader animate-spin" />
        </div>
      );

    case IndicatorState.Filled:
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
          <WarningIcon stroke={"black"} />
        </div>
      );
  }
};

export const Status = ({ localStage }: { localStage: ProcessingStages }) => {
  const currentStage = stages[localStage];

  const successStage = Object.values(stages).reduce((acc, stage) => {
    if (!acc[stage.stepNumber]) {
      if (stage.stepNumber === currentStage.stepNumber) {
        acc[stage.stepNumber] = currentStage;
      } else {
        acc[stage.stepNumber] = stage;
      }
    }
    return acc;
  }, {} as Record<number, { stepNumber: number; title: string; description: string; indicatorState?: IndicatorState }>);

  return (
    <div>
      <div className="mb-4 flex flex-row text-center justify-center items-center text-main_white text-2xl font-normal font-['Inter'] leading-normal">
        {Object.values(successStage).map(
          ({ stepNumber, indicatorState }, index) => {
            const isLast = index === Object.values(successStage).length - 1;
            const isCurrent = currentStage.stepNumber === stepNumber;
            const isPassed = currentStage.stepNumber > stepNumber;
            const isEmpty = currentStage.stepNumber < stepNumber;

            const currentState = isEmpty
              ? IndicatorState.Empty
              : isPassed
              ? IndicatorState.Filled
              : isCurrent
              ? indicatorState ?? IndicatorState.Filled
              : IndicatorState.Empty;
            return (
              <div
                key={stepNumber}
                className="flex flex-row justify-center items-center"
              >
                <StatusIndicator
                  indicatorState={currentState}
                  stepNumber={stepNumber}
                />
                {!isLast && (
                  <div
                    className={cn(
                      "w-[70px] h-[2px] bg-main_light",
                      currentStage.stepNumber > stepNumber
                        ? "bg-main_light"
                        : "bg-element"
                    )}
                  />
                )}
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
