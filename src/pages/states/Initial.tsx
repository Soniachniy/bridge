import SelectTokenDialog from "@/components/select-token-dialog";

import { enforcer, truncateAddress } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

import { useCallback, useEffect, useState } from "react";
import WalletIcon from "@/assets/wallet-icon.svg?react";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/form-error-icon.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

import useSwapQuote from "@/hooks/useSwapQuote";
import { FormInterface } from "@/lib/validation";
import { useDebounce } from "@/hooks/useDebounce";
import { ActionButton } from "@/components/ActionButtons";

import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import {
  CHAIN_TITLE,
  getTokenIcon,
  translateNetwork,
} from "@/lib/1clickHelper";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Network } from "@/config";
import { EStrategy } from "../Form";
import useNetwork from "@/hooks/useNetworkHandler";
import SelectNetworkDialog from "@/components/select-network";
import InfoIcon from "@/assets/warning-icon.svg?react";
import LogoutIcon from "@/assets/logout-icon.svg?react";
import SlippageDialog from "@/components/slippage-dialog";
import { Loader } from "lucide-react";

export const InitialView = () => {
  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  const {
    register,
    setValue,
    watch,
    setError,
    clearErrors,
    trigger,
    formState: { errors, dirtyFields },
  } = useFormContext();

  const selectedToken = watch("selectedToken");
  const amountIn = watch("amount");
  const amountOut = watch("amountOut");
  const slippageValue = watch("slippageValue");
  const hyperliquidAddress = watch("hyperliquidAddress");
  const refundAddress = watch("refundAddress");
  const strategy = watch("strategy");

  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 100 : 0, [
    amountIn,
  ]);

  const { isLoading } = useSwapQuote({
    tokenIn: selectedToken,
    amountIn: debouncedAmountIn ?? "",
    setFormValue: (key: keyof FormInterface, value: string) =>
      setValue(key, value),
    hyperliquidAddress,
    refundAddress,
    setError: (key: keyof FormInterface, value: {}) => setError(key, value),
    clearError: (key: (keyof FormInterface)[]) => clearErrors(key),
    slippageValue,
  });

  const {
    connectWallet,
    isConnected,
    getPublicKey,
    disconnectWallet,
    getBalance,
  } = useNetwork(translateNetwork(selectedToken?.blockchain), setValue);

  useEffect(() => {
    const getSelectedTokenBalance = async () => {
      try {
        if (
          selectedToken &&
          selectedToken.balanceUpdatedAt === 0 &&
          refundAddress
        ) {
          const { balance, nearBalance } = await getBalance(
            selectedToken.assetId,
            selectedToken.contractAddress,
            selectedToken.blockchain
          );
          if (balance) {
            setValue("selectedToken", {
              ...selectedToken,
              balance: balance,
              balanceNear: nearBalance,
              balanceUpdatedAt: Date.now(),
            });
            trigger("amount");
          }
        }
      } catch (e) {
        console.log(e, "error while getting balance");
      }
    };

    getSelectedTokenBalance();
  }, [selectedToken?.assetId]);

  const connectWalletHandler = useCallback(
    (network: Network) => {
      if (!isConnected(network)) connectWallet(network);
    },
    [connectWallet, isConnected]
  );

  return (
    <div className="flex flex-col gap-6">
      <SlippageDialog />

      <div className="flex flex-col gap-1 justify-center items-center w-full md:w-[480px] w-full">
        <div className="flex flex-row gap-2 justify-between w-full">
          <div className="self-stretch justify-start text-gray_text text-base font-semibold font-['Inter']">
            From
          </div>
          <SelectNetworkDialog
            connectWallet={connectWalletHandler}
            disconnectWallet={disconnectWallet}
            getPublicKey={getPublicKey}
          />
        </div>
        <div className="flex flex-row gap-2 justify-between w-full bg-[#1B2429] rounded-2xl px-4">
          <input
            {...register("amount", {
              onChange: (e) => {
                const enforcedValue = enforcer(e.target.value);
                if (enforcedValue === null) return;
                setValue("amount", enforcedValue, { shouldValidate: true });
              },
            })}
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            className={`${
              errors.amount ? "text-error" : "text-white"
            } grow-1 w-full border-none outline-none text-2xl font-light bg-transparent font-inter leading-none`}
            value={amountIn ?? ""}
            placeholder="0"
            inputMode="decimal"
            autoComplete="off"
            minLength={1}
            maxLength={79}
            spellCheck="false"
            autoCorrect="off"
          />
          <SelectTokenDialog
            {...register("selectedToken")}
            selectToken={(token) => {
              setValue("selectedToken", {
                ...token,
                balance: BigInt(0),
                balanceNear: BigInt(0),
                balanceUpdatedAt: 0,
              });
            }}
            selectedToken={selectedToken}
            getPublicKey={getPublicKey}
          />
        </div>
        {errors.amount && (
          <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
            <span>{errors.amount.message?.toString()}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 justify-center items-center w-full md:w-[480px] w-full">
        <div className="flex flex-row gap-2 justify-between w-full">
          <div className="self-stretch justify-start text-gray_text text-base font-semibold font-['Inter']">
            To
          </div>
          {!hyperliquidAddress ? (
            <div
              onClick={() => connectWallet(Network.ARBITRUM)}
              className="flex cursor-pointer flex-row gap-2 justify-center align-center text-main_light text-sm font-normal font-['Inter'] underline "
            >
              Connect Hyperliquid Wallet
            </div>
          ) : (
            <div className="flex flex-row gap-2 justify-center align-center text-main_light text-sm font-normal font-['Inter'] underline ">
              <WalletIcon fill="#97fce4" className="self-center" />
              {truncateAddress(getPublicKey(Network.ARBITRUM))}
              <LogoutIcon
                onClick={() => disconnectWallet(Network.ARBITRUM)}
                className="w-4 h-4 self-center"
              />
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2 align-center justify-between w-full bg-[#1B2429] rounded-2xl px-4">
          <span
            className={`grow-1 relative border-none outline-none text-2xl font-light bg-transparent font-inter leading-none self-center ${
              Number(amountOut) === 0 ? "text-gray_text" : "text-main_light"
            }`}
          >
            {amountOut ?? "0"}
            {isLoading && (
              <span className="text-gray_text flex flex-row gap-1 items-center text-xs font-normal font-['Inter'] absolute bottom-[-16px]">
                Loading <Loader className="size-4 animate-spin" />
              </span>
            )}
          </span>

          <div className="flex flex-row gap-2 px-2 py-2 items-center">
            <div className="relative h-[55px] flex items-center">
              <img
                src={getTokenIcon({ symbol: "USDC" } as TokenResponse)}
                alt={"USDC"}
                className="size-12 rounded-full"
              />
              <HyperliquidIcon className="absolute size-4 -bottom-1 -right-1 border border-black rounded-full" />
            </div>
            <div className="flex flex-col gap-2 items-start">
              <p className="justify-center text-white text-sm font-normal font-['Inter'] leading-none">
                USDC
              </p>
              <p className="justify-center text-gray_text text-[10px] font-normal font-['Inter'] leading-none">
                {CHAIN_TITLE[TokenResponse.blockchain.ARB]}
              </p>
            </div>
          </div>
        </div>
        {errors.amountOut && (
          <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
            <span>{errors.amountOut.message?.toString()}</span>
          </div>
        )}
        {selectedToken && !isConnected(selectedToken?.blockchain) && (
          <div className="flex flex-col gap-2 mt-6 w-full md:w-[480px]">
            <div className="flex flex-row justify-between w-full gap-2 items-center">
              <label className="text-gray_text font-normal text-xs font-inter">
                Refund address
              </label>
              <TooltipProvider>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger asChild>
                    <InfoIcon stroke="#97FCE4" className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="text-xs bg-black border-none px-4 py-4"
                  >
                    <div className="flex text-left text-white flex-col gap-1 text-main_white text-xs font-normal font-['Inter']">
                      If the swap fails, we'll refund source asset to this
                      address. If you connect Wallet on the Source chain, we
                      will us it as Refund address. (Required)
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="bg-[#1B2429] rounded-xl grow-1 p-3 flex flex-row justify-between items-center gap-7 md:w-[480px] h-12 sm:w-full">
              <div className="flex flex-col grow-1 gap-1 w-[210px]">
                <div className="flex flex-row grow-1 items-center">
                  <input
                    type="text"
                    {...register("refundAddress")}
                    className="text-white border-none outline-none text-xs font-normal bg-transparent font-inter leading-none w-full"
                    placeholder="0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
                    autoComplete="off"
                    spellCheck="false"
                    autoCorrect="off"
                  />
                </div>
              </div>

              <div className="flex flex-row justify-end items-center gap-1">
                <div className="w-6 h-6 flex items-center justify-center">
                  {refundAddress && errors.refundAddress && <ErrorIcon />}
                  {refundAddress &&
                    dirtyFields.refundAddress &&
                    !errors.refundAddress && <SuccessIcon />}
                </div>
                <div className="flex flex-row justify-end items-center gap-1">
                  <div
                    onClick={async () => {
                      const text = await window.navigator.clipboard.readText();
                      setValue("refundAddress", text);
                      trigger("refundAddress");
                    }}
                    className="text-center cursor-pointer bg-main_light rounded-[5px] px-2 py-1 justify-center text-main text-xs font-normal font-['Inter'] leading-none"
                  >
                    paste
                  </div>
                </div>
              </div>
            </div>
            {errors.refundAddress && (
              <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
                <span>{errors.refundAddress.message?.toString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <ConnectButton isLoading={isLoading} evmAddress={hyperliquidAddress} />
    </div>
  );
};

export const ConnectButton = ({
  evmAddress,
  isLoading,
}: {
  isLoading: boolean;
  evmAddress?: string;
}) => {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const { watch, trigger } = useFormContext();

  const refundAddress = watch("refundAddress");
  const selectedToken = watch("selectedToken");
  const amountIn = watch("amount");
  const strategy = watch("strategy");

  if (!evmAddress) {
    return (
      <div className="flex flex-col">
        <ActionButton variant="primary" disabled className="w-full">
          Continue
        </ActionButton>
        <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
          Hyperliquid (EVM) wallet is required for continue
        </div>
      </div>
    );
  }
  if (Number(amountIn) === 0 || !selectedToken) {
    return (
      <div className="flex flex-col">
        <ActionButton variant="primary" disabled className="w-full">
          Continue
        </ActionButton>
        <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
          Select source asset and amount
        </div>
      </div>
    );
  }
  if (strategy === EStrategy.Manual && !refundAddress) {
    return (
      <div className="flex flex-col">
        <ActionButton variant="primary" disabled className="w-full">
          Continue
        </ActionButton>
        <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
          Connect Source chain wallet or paste Refund address on the field.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ActionButton
        variant="primary"
        onClick={async () => {
          const isValid = await trigger([
            "amount",
            "amountOut",
            "selectedToken",
            "depositAddress",
          ]);
          const screen =
            strategy === EStrategy.Manual
              ? "manual_deposit"
              : "create_transaction";
          if (isValid) {
            actorRef.send({ type: screen });
          }
        }}
        className="w-full"
        disabled={isLoading}
      >
        Continue
      </ActionButton>
      <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
        Review your transaction on the next step
      </div>
    </div>
  );
};
