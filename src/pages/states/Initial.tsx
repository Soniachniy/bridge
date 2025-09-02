import SelectTokenDialog from "@/components/select-token-dialog";

import { enforcer, truncateAddress } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

import { useCallback, useEffect, useState } from "react";
import WalletIcon from "@/assets/wallet-icon.svg?react";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/form-error-icon.svg?react";

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
import { Network, translateTokenToNetwork } from "@/config";
import { EStrategy } from "../Form";
import useNetwork from "@/hooks/useNetworkHandler";
import SelectNetworkDialog from "@/components/select-network";
import LogoutIcon from "@/assets/logout-icon.svg?react";
import ArrowDown from "@/assets/arrow-down.svg?react";
import { Loader } from "lucide-react";
import { Toggle } from "@/components/toggle";
import { motion } from "framer-motion";
import SlippageDialog from "@/components/slippage-dialog";

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

  const { isFetching } = useSwapQuote({
    tokenIn: selectedToken,
    amountIn: debouncedAmountIn ?? "",
    setFormValue: (key: keyof FormInterface, value: string) =>
      setValue(key, value),
    hyperliquidAddress,
    refundAddress,
    setError: (key: keyof FormInterface, value: {}) => setError(key, value),
    clearError: (key: (keyof FormInterface)[]) => clearErrors(key),
    slippageValue,
    trigger,
  });

  const { connectWallet, isConnected, getPublicKey, disconnectWallet } =
    useNetwork(translateNetwork(selectedToken?.blockchain), setValue);

  const connectWalletHandler = useCallback(
    (network: Network) => {
      if (!isConnected(network)) connectWallet(network);
    },
    [connectWallet, isConnected]
  );

  useEffect(() => {
    if (selectedToken?.blockchain) {
      setValue(
        "refundAddress",
        getPublicKey(translateTokenToNetwork(selectedToken.blockchain))
      );
    }
  }, [
    isConnected(translateTokenToNetwork(selectedToken.blockchain)),
    selectedToken.blockchain,
  ]);

  return (
    <>
      <div className="flex flex-col justify-center items-center mb-8">
        <div className="mb-2 text-center justify-start text-main_white text-4xl font-bold font-['Inter']">
          Deposit to Hyperliquid from Any Chain
        </div>
        <span className="mb-4 opacity-60 text-center justify-start text-main_white text-base font-normal font-['Inter'] leading-normal">
          A fast and friendly way to top up your Hyperliquid account. We hide
          the complexity
          <br /> of bridges: just connect your wallet, pick an asset, and we do
          the rest.
        </span>
      </div>
      <motion.div
        layout="preserve-aspect"
        transition={{
          height: { duration: 4, ease: "easeInOut" },
        }}
        className="flex flex-col gap-6 bg-form rounded-4xl p-6 w-full md:w-[540px]"
      >
        <Toggle />
        <div className="flex flex-col gap-4 justify-center items-center bg-input-custom rounded-3xl p-[16px] ">
          {strategy === EStrategy.Wallet && (
            <SelectNetworkDialog
              connectWallet={connectWalletHandler}
              disconnectWallet={disconnectWallet}
              getPublicKey={getPublicKey}
            />
          )}
          <div className="flex flex-row gap-2 justify-between w-full rounded-2xl">
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
                errors.amount ? "text-error" : "text-main_white"
              } grow-1 w-full border-none outline-none placeholder:text-main_white text-3xl font-semibold bg-transparent font-inter leading-none`}
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
            <div className="text-error word-break text-xs w-full font-normal text-left  font-inter">
              <span>{errors.amount.message?.toString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-row align-center justify-center relative">
          <SlippageDialog />
          <ArrowDown className="self-center" />
        </div>

        <div className="flex flex-col gap-2 justify-center items-center w-full bg-input-custom rounded-3xl p-[16px]  w-full">
          <div className="flex flex-row gap-2 justify-between w-full">
            {!hyperliquidAddress && (
              <div className="select-none text-center justify-center flex flex-row items-center gap-2 relative text-main_white text-base font-normal font-['Inter'] leading-normal">
                <div className="size-3 left-[6px] top-[6px] bg-red-400 rounded-full" />
                <span>Connect Hyperliquid Wallet</span>
              </div>
            )}

            {!hyperliquidAddress ? (
              <div
                onClick={() => connectWallet(Network.ARBITRUM)}
                className="text-main text-base font-semibold font-['Inter'] bg-main_light rounded-md px-2 py-1 cursor-pointer"
              >
                Connect
              </div>
            ) : (
              <div className="flex w-full flex-row gap-2 justify-end align-center text-main_light text-sm font-normal font-['Inter'] underline ">
                <WalletIcon fill="#97fce4" className="self-center" />
                {truncateAddress(getPublicKey(Network.ARBITRUM))}
                <LogoutIcon
                  onClick={() => disconnectWallet(Network.ARBITRUM)}
                  className="w-4 h-4 self-center"
                />
              </div>
            )}
          </div>
          <div className="flex flex-row gap-2 align-center justify-between w-full rounded-2xl">
            <span
              className={`grow-1 relative border-none outline-none text-main_white text-3xl font-semibold bg-transparent font-inter self-center`}
            >
              {amountOut ?? "0"}
              {isFetching && (
                <span className="text-gray_text flex flex-row gap-1 items-center text-xs font-normal font-['Inter'] absolute bottom-[-16px]">
                  Loading <Loader className="size-4 animate-spin" />
                </span>
              )}
            </span>

            <div className="flex flex-row gap-2 px-2 py-2 items-center">
              <div className="relative flex items-center">
                <div className="size-10 flex items-center justify-center rounded-full bg-white">
                  <img
                    src={getTokenIcon({ symbol: "USDC" } as TokenResponse)}
                    alt={"USDC"}
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
                  {CHAIN_TITLE[TokenResponse.blockchain.ARB]}
                </p>
              </div>
            </div>
          </div>
          {errors.amountOut && (
            <div className="text-error word-break text-xs w-full font-normal text-left  font-inter">
              <span>{errors.amountOut.message?.toString()}</span>
            </div>
          )}
        </div>
        {strategy === EStrategy.Manual ? (
          <div className="flex mt-6 px-4 flex-col gap-3 w-full">
            <div className="flex flex-col gap-2">
              <div className="justify-center text-main_white text-sm font-normal font-['Inter'] leading-none">
                Refund Address
              </div>
              <div className="justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
                If the swap fails, your assets will be refunded to this address.
              </div>
            </div>
            <div className="rounded-xl grow-1 p-3 flex border-1 border-[#458779] active:border-main_light hover:border-main_light flex-row justify-between items-center w-full h-12">
              <div className="flex flex-col grow-1 gap-1 w-full">
                <input
                  type="text"
                  {...register("refundAddress")}
                  className="text-white border-none outline-none text-xs font-normal grow-1  font-inter leading-none w-full"
                  placeholder="0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
                  autoComplete="off"
                  spellCheck="false"
                  autoCorrect="off"
                />
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
                    className="text-center cursor-pointer rounded-[5px] px-2 py-1 justify-center  text-main_light text-base font-semibold font-['Inter'] leading-none"
                  >
                    Paste
                  </div>
                </div>
              </div>
            </div>
            {errors.refundAddress && (
              <div className="text-error word-break text-xs w-full font-normal text-left  font-inter">
                <span>{errors.refundAddress.message?.toString()}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
            Refunds (if needed) will be sent to your Source Wallet
          </div>
        )}
        <ConnectButton isLoading={isFetching} evmAddress={hyperliquidAddress} />
      </motion.div>
    </>
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
  const {
    watch,
    formState: { isValid },
  } = useFormContext();
  const refundAddress = watch("refundAddress");
  const selectedToken = watch("selectedToken");
  const amountIn = watch("amount");
  const strategy = watch("strategy");

  if (!evmAddress) {
    return (
      <div className="flex flex-col w-full">
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
      <div className="flex flex-col w-full">
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
      <div className="flex flex-col w-full">
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
    <div className="flex flex-col w-full">
      <ActionButton
        variant="primary"
        onClick={async () => {
          if (!isValid) {
            return;
          }
          const screen =
            strategy === EStrategy.Manual
              ? "manual_deposit"
              : "create_transaction";
          if (isValid) {
            actorRef.send({ type: screen });
            actorRef.send({ type: "start_processing" });
          }
        }}
        className="w-full"
        disabled={isLoading || !isValid}
      >
        Continue
      </ActionButton>
      <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
        Review your transaction on the next step
      </div>
    </div>
  );
};
