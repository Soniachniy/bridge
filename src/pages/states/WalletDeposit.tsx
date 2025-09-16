import {
  CHAIN_ICON,
  CHAIN_TITLE,
  getTokenIcon,
  translateNetwork,
} from "@/lib/1clickHelper";
import { useFormContext } from "react-hook-form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { ActionButton } from "@/components/ActionButtons";
import ArrowDown from "@/assets/arrow-down.svg?react";

import { formatTokenAmount, truncateAddress } from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";

import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import LoadingIcon from "@/assets/loading-icon.svg?react";
import useNetwork from "@/hooks/useNetworkHandler";
import { useTokens } from "@/providers/token-context";
import { FormInterface } from "@/lib/validation";
import { BridgeFormMachineContext } from "@/providers/machine-provider";
import { useState } from "react";
import { useLocalStoreTimer } from "@/hooks/useLocalStoreTimer";

export const WalletDepositView = () => {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const [isLoading, setIsLoading] = useState(false);
  const { watch } = useFormContext<FormInterface>();
  const { tokens } = useTokens();
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
  const { timeLeftFormatted, timeLeft } = useLocalStoreTimer();

  return (
    <>
      <div className="flex flex-col gap-6 self-center inline-flex justify-between items-start bg-form rounded-4xl p-6 w-full md:w-[540px]">
        <div className="flex flex-col gap-2 w-full">
          <div className="self-stretch text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
            Confirm Transaction Details
          </div>
          <div className="self-stretch text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-tight">
            Double-check the details before proceeding.
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
          <ArrowDown className="rotate-270" />

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
        <div className="self-stretch text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-none">
          You will receive at least {amountOut} USDC or the transaction will be
          refunded
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

        <div className="flex flex-row gap-2 px-4 w-full">
          <ActionButton
            variant="secondary"
            className="flex-1"
            onClick={() => {
              actorRef.send({ type: "back_to_asset_selection" });
            }}
          >
            Back
          </ActionButton>
          <ActionButton
            variant="primary"
            className="flex-5"
            disabled={isLoading}
            onClick={async () => {
              if (!selectedToken || !depositAddress || !amountIn || !tokens) {
                return;
              }
              setIsLoading(true);
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

              if (!result) {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              <div className="flex flex-row  gap-2 items-center">
                Confirming deposit
                <LoadingIcon className="animate-spin" fill={"#0F1A20"} />
              </div>
            ) : (
              "Confirm & Create Transaction"
            )}
          </ActionButton>
        </div>
      </div>
    </>
  );
};
