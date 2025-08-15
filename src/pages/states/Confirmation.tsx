import {
  CHAIN_ICON,
  CHAIN_TITLE,
  getTokenIcon,
  translateNetwork,
} from "@/lib/1clickHelper";
import { useFormContext } from "react-hook-form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { ActionButton } from "@/components/ActionButtons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTokenAmount } from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";

import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import useNetwork from "@/hooks/useNetworkHandler";
import { useTokens } from "@/providers/token-context";
import { FormInterface } from "@/lib/validation";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

export const ConfirmationView = () => {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const { watch } = useFormContext<FormInterface>();
  const tokens = useTokens();
  const selectedToken = watch("selectedToken");
  const { makeDeposit } = useNetwork(
    translateNetwork(selectedToken?.blockchain)
  );
  const amountOut = watch("amountOut");
  const amountIn: string = watch("amount");
  const depositAddress = watch("depositAddress");
  const platformFee = watch("platformFee");
  const gasFee = watch("gasFee");
  const refundAddress = watch("refundAddress");
  const hyperliquidAddress: string = watch("hyperliquidAddress");

  return (
    <>
      <div className="flex flex-col self-center inline-flex justify-between items-start mx-4 my-8 md:w-[480px] w-full">
        <div className="size- inline-flex flex-row justify-between items-center gap-1 w-full my-auto bg-main_dark px-6 py-4 rounded-2xl">
          <div className="text-center justify-center text-main_light text-sm font-semibold font-['Inter'] leading-none">
            ≥{amountOut} USDC
          </div>

          <div className="text-center justify-center text-white text-xs font-normal font-['Inter'] leading-none">
            in Hyperliquid perps{" "}
            <TooltipProvider>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span className="text-gray_text  cursor-help">
                    (includes fees)
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="end"
                  className="text-xs bg-black border-none px-4 py-4"
                >
                  <div className="flex text-left text-white  flex-col gap-1">
                    <div>
                      Gas fee:{" "}
                      <span className="text-main_light ">
                        {formatTokenAmount(gasFee, USDC_DECIMALS)} USDC
                      </span>
                    </div>
                    <div>
                      Platform fee:{" "}
                      <span className="text-main_light">
                        {formatTokenAmount(platformFee, USDC_DECIMALS)} USDC
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full mt-4">
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset from:
            </div>
            <div className="flex flex-row items-center gap-2">
              {selectedToken && (
                <div className="relative size-6 flex items-center">
                  <img
                    src={getTokenIcon(selectedToken)}
                    alt={selectedToken?.assetId ?? "token"}
                    className="size-6 rounded-full"
                  />
                  <img
                    src={CHAIN_ICON[selectedToken?.blockchain]}
                    alt={selectedToken?.blockchain ?? "blockchain"}
                    className="absolute size-3 -bottom-1 -right-1 border border-white rounded-full"
                  />
                </div>
              )}
              <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
                {selectedToken?.symbol}
              </div>
              <div className="text-center justify-center text-main_white text-[10px] font-normal font-['Inter'] leading-3">
                {
                  CHAIN_TITLE[
                    selectedToken?.blockchain ?? TokenResponse.blockchain.ETH
                  ]
                }
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset to:
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="relative size-6 flex items-center">
                <img
                  src={getTokenIcon({ symbol: "USDC" } as TokenResponse)}
                  alt={"USDC"}
                  className="size-6 rounded-full"
                />
                <HyperliquidIcon className="absolute size-3 -bottom-1 -right-1 border border-black rounded-full" />
              </div>

              <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
                {selectedToken?.symbol}
              </div>
              <div className="text-center justify-center text-main_white text-[10px] font-normal font-['Inter'] leading-3">
                Hyperliquid
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Refund address:
            </div>
            <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-none">
              {refundAddress}
            </div>
          </div>
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Hyperliquid address:
            </div>
            <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-none">
              {hyperliquidAddress}
            </div>
          </div>
        </div>
      </div>
      <ActionButton
        variant="primary"
        className="w-full"
        onClick={async () => {
          if (!selectedToken || !depositAddress || !amountIn) {
            return;
          }
          const result = await makeDeposit(
            selectedToken,
            depositAddress,
            amountIn,
            tokens[selectedToken?.assetId].decimals,
            {
              balance: selectedToken.balance,
              nearBalance: selectedToken.balanceNear,
            }
          );
          if (result) {
            actorRef.send({ type: "awaiting_deposit" });
          }
        }}
      >
        Confirm deposit
      </ActionButton>
    </>
  );
};
