import { useEffect, useState } from "react";

import { getDepositStatus, translateNetwork } from "@/lib/1clickHelper";

import {
  enforcer,
  formatTokenAmount,
  isSupportedNetwork,
  truncateAddress,
} from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import useNetwork from "@/hooks/useNetworkHandler";
import { renderActionButtons } from "@/components/ActionButtons";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/error-icon.svg?react";
import WalletIcon from "@/assets/wallet-icon.svg?react";
import ManualIcon from "@/assets/manual.svg?react";
import CopyIcon from "@/assets/copy-icon.svg?react";
import QRCodeIcon from "@/assets/qr-code-icon.svg?react";

import { createFormValidationSchema, FormInterface } from "@/lib/validation";
import useSwapQuote from "@/hooks/use-swap-quote";
import {
  fetchTokens,
  execute,
  getPermitData,
} from "@/providers/proxy-provider";
import { sliceHex } from "viem";
import useManualDeposit from "@/hooks/use-manual-deposit";

export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export enum EStrategy {
  SWAP = "swap",
  DEPOSIT = "deposit",
}

export default function Form() {
  const [strategy, setStrategy] = useState<EStrategy>(EStrategy.SWAP);

  const {
    control,
    setValue,
    handleSubmit,
    register,
    setError,
    clearErrors,
    watch,
    formState: { errors, dirtyFields, isSubmitting, isValidating },
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
      connectedEVMWallet: false,
    },
  });
  const selectedToken = useWatch({ control, name: "selectedToken" });

  const amountIn = useWatch({ control: control, name: "amount" });
  const amountOut = useWatch({ control: control, name: "amountOut" });
  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 2000 : 0, [
    amountIn,
  ]);
  const queryClient = useQueryClient();
  const hyperliquidAddress = useWatch({ control, name: "hyperliquidAddress" });
  const refundAddress = useWatch({ control, name: "refundAddress" });
  const depositAddress = useWatch({ control, name: "depositAddress" });
  const connectedEVMWallet = useWatch({ control, name: "connectedEVMWallet" });

  useSwapQuote({
    tokenIn: selectedToken,
    amountIn: debouncedAmountIn ?? "",
    setFormValue: (key: keyof FormInterface, value: string) =>
      setValue(key, value),
    hyperliquidAddress,
    refundAddress,
    setError: (key: keyof FormInterface, value: {}) => setError(key, value),
    clearError: (key: (keyof FormInterface)[]) => clearErrors(key),
  });

  const {
    connectWallet,
    getPublicKey,
    isConnected,
    getBalance,
    makeDeposit,
    signData,
  } = useNetwork(translateNetwork(selectedToken?.blockchain), setValue, watch);

  useManualDeposit(strategy, signData, depositAddress);

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
  }, [selectedToken, hyperliquidAddress, refundAddress]);

  useEffect(() => {
    if (selectedToken) {
      const isSupported = isSupportedNetwork(
        translateNetwork(selectedToken.blockchain)
      );
      if (!isSupported) {
        setStrategy(EStrategy.DEPOSIT);
      } else {
        setStrategy(EStrategy.SWAP);
      }
    }
  }, [selectedToken]);

  const onSubmit = async () => {
    await queryClient.invalidateQueries({
      queryKey: [
        "quote",
        debouncedAmountIn,
        hyperliquidAddress,
        refundAddress,
        selectedToken?.assetId,
      ],
    });

    if (depositAddress && selectedToken) {
      console.log(depositAddress, "start");
      const success = await makeDeposit(
        selectedToken,
        depositAddress,
        amountIn,
        selectedToken.decimals
      );
      console.log(success, "success");
      localStorage.setItem("depositAddress", depositAddress);
      const depositStatus = await getDepositStatus(depositAddress);

      if (depositStatus.status) {
        const permitData = await getPermitData(depositAddress);
        console.log(permitData, "permitData");
        const signature = await signData(permitData);
        console.log(signature, "signData");
        if (signature) {
          const r = sliceHex(signature, 0, 32);
          const s = sliceHex(signature, 32, 64);
          const vByte = sliceHex(signature, 64, 65);
          const v = parseInt(vByte, 16);

          const proccess = await execute(depositAddress, {
            v: v,
            r: r,
            s: s,
          });
          console.log(proccess, "proccess");
        }
      }
      // console.log(success);
    }
  };
  console.log(connectedEVMWallet, "connectedEVMWallet");
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
            <div className="text-error word-break text-xs w-[480px] font-normal text-left  font-inter">
              <span>{errors.amount.message}</span>
            </div>
          )}
        </div>

        {selectedToken && (
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
                  <div className="flex flex-row justify-end items-center gap-1">
                    <div
                      onClick={async () => {
                        const text =
                          await window.navigator.clipboard.readText();
                        setValue("hyperliquidAddress", text);
                      }}
                      className="text-center cursor-pointer bg-main_light rounded-[5px] px-2 py-1 justify-center text-main text-xs font-normal font-['Inter'] leading-none"
                    >
                      paste
                    </div>
                  </div>
                </div>
              </div>
              {errors.hyperliquidAddress && (
                <div className="text-error word-break text-xs w-[480px] font-normal text-left  font-inter">
                  <span>{errors.hyperliquidAddress.message}</span>
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
                        const text =
                          await window.navigator.clipboard.readText();
                        setValue("refundAddress", text);
                      }}
                      className="text-center cursor-pointer bg-main_light rounded-[5px] px-2 py-1 justify-center text-main text-xs font-normal font-['Inter'] leading-none"
                    >
                      paste
                    </div>
                  </div>
                </div>
              </div>
              {errors.refundAddress && (
                <div className="text-error word-break text-xs w-[480px] font-normal text-left  font-inter">
                  <span>{errors.refundAddress.message}</span>
                </div>
              )}
            </div>
          </>
        )}
        {!isSupportedNetwork(translateNetwork(selectedToken?.blockchain)) &&
          connectedEVMWallet &&
          depositAddress && (
            <div className="self-stretch py-6 inline-flex flex-col justify-start items-center gap-4">
              <div className="size- flex flex-col justify-start items-center gap-1">
                <div className="justify-center text-gray_text text-2xl font-normal font-['Inter'] leading-normal">
                  Your deposit address.
                </div>
                <div className="justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
                  Send assets manually to this address.
                </div>
              </div>
              <div className="text-center justify-center text-main_white text-sm font-normal font-['Inter'] leading-none">
                {depositAddress}
              </div>
              <div className="size- inline-flex justify-start items-start gap-2">
                <div className="size- inline-flex justify-start items-start">
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(depositAddress ?? "");
                    }}
                    className="cursor-pointer pl-2 pr-4 py-2 bg-main_light rounded-[10px] flex justify-center items-center gap-2 overflow-hidden"
                  >
                    <CopyIcon />
                    <div className="justify-center text-black text-sm font-normal font-['DM_Sans'] leading-normal">
                      Copy address
                    </div>
                  </div>
                </div>
                <div className="cursor-pointer flex justify-start items-start">
                  <div className="size- p-2 bg-main_light rounded-[10px] flex justify-center items-center overflow-hidden">
                    <QRCodeIcon />
                  </div>
                </div>
              </div>
            </div>
          )}

        {renderActionButtons(
          selectedToken,
          strategy,
          setStrategy,
          connectWallet,
          isConnected(),
          isSubmitting,
          isValidating,
          connectedEVMWallet
        )}
      </form>
    </div>
  );
}
