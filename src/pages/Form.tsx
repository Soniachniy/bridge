import { useEffect, useState } from "react";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import {
  fetchTokens,
  OneClickSwapFormValues,
  translateNetwork,
} from "@/lib/1clickHelper";
import { Network } from "@/config";
import { enforcer, formatTokenAmount, truncateAddress } from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import useNetwork from "@/hooks/useNetworkHandler";
import { renderActionButtons } from "@/components/ActionButtons";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/error-icon.svg?react";
import WalletIcon from "@/assets/wallet-icon.svg?react";
import ManualIcon from "@/assets/manual.svg?react";

import {
  createFormValidationSchema,
  FormInterface,
  FormValidationData,
} from "@/lib/validation";
import useSwapQuote from "@/hooks/use-swap-quote";

export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export enum EStrategy {
  SWAP = "swap",
  DEPOSIT = "deposit",
}

export default function Form() {
  const [strategy, setStrategy] = useState<EStrategy | null>(null);

  const {
    control,
    setValue,
    handleSubmit,
    register,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(createFormValidationSchema(strategy)),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      amount: "",
      amountOut: "",
      selectedToken: null,
      hyperliquidAddress: "",
      refundAddress: "",
      depositAddress: "",
    },
  });
  const selectedToken = useWatch({ control, name: "selectedToken" });

  const amountIn = useWatch({ control: control, name: "amount" });
  const amountOut = useWatch({ control: control, name: "amountOut" });
  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 2000 : 0, [
    amountIn,
  ]);

  const hyperliquidAddress = useWatch({ control, name: "hyperliquidAddress" });
  const refundAddress = useWatch({ control, name: "refundAddress" });

  useSwapQuote({
    tokenIn: selectedToken,
    amountIn: debouncedAmountIn ?? "",
    setFormValue: (key: keyof FormInterface, value: string) =>
      setValue(key, value),
    recipient: hyperliquidAddress,
    slippage: "0.5",
    refundAddress: refundAddress,
  });

  const { connectWallet, getPublicKey, isConnected, getBalance } = useNetwork(
    translateNetwork(selectedToken?.blockchain)
  );

  const { data } = useQuery({
    queryKey: ["one-click-tokens"],
    queryFn: async () => {
      const response = await fetchTokens();
      return response;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const getSelectedTokenBalance = async () => {
      if (selectedToken && selectedToken.balanceUpdatedAt === 0) {
        const balance = await getBalance(selectedToken.contractAddress);
        if (balance) {
          setValue("selectedToken", {
            ...selectedToken,
            balance: balance.toString(),
            balanceUpdatedAt: Date.now(),
          });
        }
      }
    };
    getSelectedTokenBalance();
  }, [selectedToken]);

  const onSubmit = (data: FormValidationData) => {
    console.log("onSubmit", data);
  };

  return (
    <div className="p-4 w-full min-h-96">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="text-2xl text-white font-inter font-normal">
          Bridge to USDC on Arbitrum
        </div>
        <span className=" text-white font-light text-xs">
          Select asset and network you want to swap to USDC for Hyperliquid
          deposit.
        </span>
      </div>
      <div className="flex flex-col justify-center items-center mb-10">
        <div className="flex flex-col gap-2 justify-center items-center">
          <div className="flex flex-row gap-2 justify-between w-[480px]">
            <div className="text-white font-thin text-sm text-left  w-[480px]">
              From
            </div>
            {strategy && isConnected() && strategy === EStrategy.SWAP && (
              <div className="text-white font-thin text-sm flex flex-row gap-2 items-center justify-end w-[480px] text-right">
                <WalletIcon />
                {truncateAddress(getPublicKey())}
              </div>
            )}
            {strategy && strategy === EStrategy.DEPOSIT && (
              <div className="text-white font-thin text-sm flex flex-row gap-2 items-center justify-end w-[480px] text-right">
                <ManualIcon />
                Manual deposit
              </div>
            )}
          </div>
          <SelectTokenDialog
            {...register("selectedToken")}
            allTokens={data ?? []}
            selectToken={(token) => {
              setValue("selectedToken", {
                ...token,
                balance: "0",
                balanceUpdatedAt: 0,
              });
            }}
            selectedToken={selectedToken}
          />
        </div>
      </div>
      <form
        className="flex flex-col justify-center items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="from" className="text-white font-thin text-sm">
            Amount
          </label>
          <div className="bg-[#1B2429] rounded-2xl p-3 flex flex-row justify-between items-center gap-7 hover:bg-[#29343a] w-[480px] h-[75px]">
            <div className="flex grow-1 flex-col gap-1 w-[210px]">
              <div className="flex grow-1 flex-row items-center gap-7">
                <input
                  {...register("amount", {
                    onChange: (e) => {
                      const enforcedValue = enforcer(e.target.value);
                      if (enforcedValue === null) return;
                      setValue("amount", enforcedValue);
                    },
                  })}
                  type="text"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  className={`${
                    errors.amount ? "text-error" : "text-white"
                  } grow-1 border-none outline-none text-2xl font-light bg-transparent font-inter leading-none`}
                  value={amountIn ?? ""}
                  placeholder="0"
                  inputMode="decimal"
                  autoComplete="off"
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  className="text-[#97FCE4] text-sm font-semibold font-inter leading-[16px] hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (selectedToken?.balance) {
                      setValue(
                        "amount",
                        formatTokenAmount(
                          selectedToken?.balance ?? 0,
                          selectedToken?.decimals
                        ) ?? "0"
                      );
                    }
                  }}
                >
                  Max
                </button>
              </div>
              <div className="flex flex-row gap-1 justify-between">
                <span className="text-white text-xs font-light font-inter leading-[14px]">
                  {amountOut && (
                    <span className="text-white text-xs font-light font-inter leading-[14px]">
                      At least ${amountOut} USDC
                    </span>
                  )}
                </span>
                <span className="text-[#9DB2BD] text-xs font-light font-inter leading-[14px]">
                  {formatTokenAmount(
                    selectedToken?.balance ?? 0,
                    selectedToken?.decimals
                  )}{" "}
                  {selectedToken?.symbol}
                </span>
              </div>
            </div>
          </div>
          {errors.amount && (
            <div className="text-error text-xs font-normal text-left w-full font-inter">
              {errors.amount.message}
            </div>
          )}
        </div>

        {strategy && (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <label className="text-[#9DB2BD] font-normal text-xs font-inter">
                Your Hyperliquid address
              </label>
              <div className="bg-[#1B2429] rounded-xl p-3 flex flex-row justify-between items-center gap-7 w-[480px] h-12">
                <div className="flex flex-col grow-1 gap-1 w-[210px]">
                  <div className="flex flex-row grow-1 items-center">
                    <input
                      type="text"
                      {...register("hyperliquidAddress")}
                      className="text-white grow-1 border-none outline-none text-xs font-normal bg-transparent font-inter leading-none w-full"
                      value={hyperliquidAddress ?? ""}
                      placeholder="0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
                      autoComplete="off"
                      spellCheck="false"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-end items-center gap-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {hyperliquidAddress && errors.hyperliquidAddress && (
                      <ErrorIcon />
                    )}
                    {hyperliquidAddress &&
                      dirtyFields.hyperliquidAddress &&
                      !errors.hyperliquidAddress && <SuccessIcon />}
                  </div>
                </div>
              </div>
              {errors.hyperliquidAddress && (
                <div className="text-error text-xs font-normal text-left w-full font-inter">
                  {errors.hyperliquidAddress.message}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <label className="text-[#9DB2BD] font-normal text-xs font-inter">
                Refund address
              </label>
              <div className="bg-[#1B2429] rounded-xl grow-1 p-3 flex flex-row justify-between items-center gap-7 w-[480px] h-12">
                <div className="flex flex-col grow-1 gap-1 w-[210px]">
                  <div className="flex flex-row grow-1 items-center">
                    <input
                      type="text"
                      {...register("refundAddress")}
                      className="text-white border-none outline-none text-xs font-normal bg-transparent font-inter leading-none w-full"
                      value={refundAddress ?? ""}
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
                </div>
              </div>
              {errors.refundAddress && (
                <div className="text-error text-xs font-normal text-left w-full font-inter">
                  {errors.refundAddress.message}
                </div>
              )}
            </div>
          </>
        )}

        {renderActionButtons(
          selectedToken,
          strategy,
          setStrategy,
          connectWallet,
          isConnected()
        )}
      </form>
    </div>
  );
}
