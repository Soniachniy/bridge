import OpenQrDialog from "@/components/open-qr-dialog";

import {
  CHAIN_ICON,
  CHAIN_TITLE,
  getTokenIcon,
  translateNetwork,
} from "@/lib/1clickHelper";

import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import CopyIcon from "@/assets/copy-icon.svg?react";
import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import { ActionButton } from "@/components/ActionButtons";
import { FormInterface } from "@/lib/validation";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

export const DepositView = () => {
  const { watch } = useFormContext<FormInterface>();
  const actorRef = BridgeFormMachineContext.useActorRef();
  const amountIn: string = watch("amount");
  const amountOut = watch("amountOut");
  const selectedToken = watch("selectedToken");

  const depositAddress = watch("depositAddress");
  const refundAddress = watch("refundAddress");
  const hyperliquidAddress = watch("hyperliquidAddress");

  const handleCopyAddress = useCallback(async () => {
    if (depositAddress) {
      try {
        await navigator.clipboard.writeText(depositAddress);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  }, [depositAddress]);

  return (
    <div className="flex flex-col gap-6 md:w-[480px] sm:w-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2 w-full">
          <div className="justify-start text-gray_text text-base font-semibold font-['Inter'] leading-normal">
            Network
          </div>
          <div className="flex flex-row gap-2 items-center justify-start text-main_white text-xs font-semibold font-['Inter'] ">
            {selectedToken?.blockchain && (
              <div className="flex flex-row gap-2">
                <img
                  src={CHAIN_ICON[selectedToken?.blockchain]}
                  alt={selectedToken?.blockchain ?? "blockchain"}
                  className="size-6 rounded-full"
                />
              </div>
            )}
            {
              CHAIN_TITLE[
                selectedToken?.blockchain ?? TokenResponse.blockchain.ETH
              ]
            }
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="justify-start text-gray_text text-base font-semibold font-['Inter'] leading-normal">
            Your deposit address
          </div>
          <div className="flex flex-col gap-2 border border-element rounded-lg p-2 px-4">
            <div className="flex grow-1 flex-row items-center gap-7">
              <span
                className={`text-white grow-1 border-none whitespace-nowrap overflow-hidden text-ellipsis outline-none text-main_white text-xs font-semibold font-['Inter'] bg-transparent font-inter leading-none`}
              >
                {depositAddress}
              </span>

              <div className="flex flex-row gap-2">
                <button
                  onClick={handleCopyAddress}
                  className=" text-xs text-center font-normal font-['Inter'] leading-normal cursor-pointer bg-main_light rounded-md px-1 flex flex-row gap-1 items-center"
                >
                  <CopyIcon className="size-5" />
                  Copy
                </button>
                <OpenQrDialog
                  network={translateNetwork(selectedToken?.blockchain)}
                  depositAddress={depositAddress!}
                  value={amountIn}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="justify-start text-gray_text text-base font-semibold font-['Inter'] leading-normal">
            Amount
          </div>
          <div className="flex flex-col gap-2 border border-element rounded-lg p-2 px-4">
            <div className="flex grow-1 flex-row items-center gap-7">
              <span
                className={`text-white grow-1 border-none whitespace-nowrap overflow-hidden text-ellipsis outline-none text-main_white text-xs font-semibold font-['Inter'] bg-transparent font-inter leading-none`}
              >
                {amountIn} {selectedToken?.symbol}
              </span>

              <div className="flex flex-row gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(amountIn);
                  }}
                  className=" text-xs text-center font-normal font-['Inter'] leading-normal cursor-pointer bg-main_light rounded-md px-1 h-7 flex flex-row gap-1 items-center"
                >
                  <CopyIcon className="size-5" />
                  Copy
                </button>
              </div>
            </div>
          </div>
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
            Amount to receive:
          </div>
          <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-none">
            {amountOut} USDC
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
      <ActionButton
        variant="primary"
        onClick={() => {
          actorRef.send({ type: "start_processing" });
        }}
        className="w-full"
      >
        Confirm deposit
      </ActionButton>
    </div>
  );
};
