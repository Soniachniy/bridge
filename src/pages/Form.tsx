import { useEffect, useState } from "react";

import { translateNetwork } from "@/lib/1clickHelper";

import { enforcer, formatTokenAmount, isSupportedNetwork } from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import useNetwork from "@/hooks/useNetworkHandler";
import ActionButtons from "@/components/ActionButtons";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/error-icon.svg?react";
import ManualIcon from "@/assets/manual.svg?react";

import { createFormValidationSchema, FormInterface } from "@/lib/validation";
import useSwapQuote from "@/hooks/useSwapQuote";

import { useNavigate } from "react-router-dom";
import { Spinner } from "@radix-ui/themes";
import { Network } from "@/config";
import SlippageDialog from "@/components/slippage-dialog";
import DepositAddressSection from "@/components/DepositAddressSection";
import { SLIPPAGE } from "@/lib/constants";
import { useTokens } from "@/providers/token-context";

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
  const navigate = useNavigate();
  const {
    control,
    setValue,
    handleSubmit,
    register,
    setError,
    clearErrors,
    watch,
    trigger,
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
      slippageValue: SLIPPAGE,
    },
  });
  const selectedToken = useWatch({ control, name: "selectedToken" });
  const slippageValue = useWatch({ control, name: "slippageValue" });
  const amountIn = useWatch({ control: control, name: "amount" });
  const amountOut = useWatch({ control: control, name: "amountOut" });
  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 500 : 0, [
    amountIn,
  ]);

  const hyperliquidAddress = useWatch({ control, name: "hyperliquidAddress" });
  const refundAddress = useWatch({ control, name: "refundAddress" });
  const depositAddress = useWatch({ control, name: "depositAddress" });
  const connectedEVMWallet = useWatch({ control, name: "connectedEVMWallet" });

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

  const { connectWallet, getPublicKey, isConnected, getBalance, makeDeposit } =
    useNetwork(translateNetwork(selectedToken?.blockchain), setValue, watch);

  const data = useTokens();

  useEffect(() => {
    const getSelectedTokenBalance = async () => {
      try {
        if (selectedToken && selectedToken.balanceUpdatedAt === 0) {
          const { balance, nearBalance } = await getBalance(
            selectedToken.assetId,
            selectedToken.contractAddress
          );
          if (balance) {
            setValue("selectedToken", {
              ...selectedToken,
              balance: balance,
              balanceNear: nearBalance,
              balanceUpdatedAt: Date.now(),
            });
          }
        }
      } catch (e) {
        console.log(e, "error while getting balance");
      }
    };

    getSelectedTokenBalance();
  }, [selectedToken?.assetId]);

  useEffect(() => {
    if (selectedToken && selectedToken.blockchain) {
      setValue(
        "refundAddress",
        getPublicKey(translateNetwork(selectedToken.blockchain)) ?? ""
      );
    }
  }, [selectedToken?.blockchain]);

  useEffect(() => {
    if (selectedToken) {
      const isSupported = isSupportedNetwork(
        translateNetwork(selectedToken.blockchain)
      );
      if (!isSupported) {
        setStrategy(EStrategy.DEPOSIT);
      }
    }
  }, [selectedToken]);

  const onSubmit = async () => {
    if (strategy === EStrategy.DEPOSIT) {
      return navigate(`/${depositAddress}`);
    }

    if (depositAddress && selectedToken) {
      await makeDeposit(
        selectedToken,
        depositAddress,
        amountIn,
        selectedToken.decimals,
        {
          balance: BigInt(selectedToken.balance),
          nearBalance: BigInt(selectedToken.balanceNear ?? "0"),
        }
      );
      navigate(`/${depositAddress}`);
    }
  };

  return (
    <div className="p-4 w-full min-h-96">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="text-2xl text-white font-inter font-normal">
          Bridge to USDC on Arbitrum
        </div>
        <span className=" text-white font-light text-center text-xs">
          Select asset and network you want to swap to USDC for Hyperliquid
          deposit.
        </span>
      </div>
      <div className="flex flex-col justify-center items-center mb-10">
        <div className="flex flex-col gap-2 justify-center items-center w-full">
          <div className="flex flex-row gap-2 justify-between md:w-[480px] w-full">
            <div className="text-white font-thin text-sm text-left w-full md:w-[480px]">
              From
            </div>

            {strategy && strategy === EStrategy.DEPOSIT && (
              <div className="text-white font-thin text-sm flex flex-row gap-2 items-center justify-end md:w-[480px] text-right">
                <ManualIcon />
                Manual deposit
              </div>
            )}
          </div>
          <SelectTokenDialog
            {...register("selectedToken")}
            allTokens={Object.values(data ?? {})}
            selectToken={(token) => {
              console.log("seold2");
              setValue("selectedToken", {
                ...token,
                balance: 0n,
                balanceNear: 0n,
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
        <div className="flex flex-row gap-2 justify-between w-full md:w-[480px] sm:w-full">
          <span className="text-white font-thin text-sm">Amount</span>
          <SlippageDialog
            slippageValue={slippageValue}
            setSlippageValue={(value) => setValue("slippageValue", value)}
          />
        </div>
        <div className="bg-[#1B2429] w-full rounded-2xl p-3 flex flex-row justify-between items-center gap-7 hover:bg-[#29343a] md:w-[480px] h-[75px] sm:w-full">
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
                        selectedToken?.balance ?? 0n,
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
                {isLoading ? (
                  <span className="text-white flex flex-row gap-1 items-center text-xs font-light font-inter leading-[14px]">
                    Loading <Spinner size="1" />
                  </span>
                ) : amountOut ? (
                  <span className="text-white text-xs font-light font-inter leading-[14px]">
                    At least ${amountOut} USDC
                  </span>
                ) : null}
              </span>
              <span className="text-[#9DB2BD] text-xs font-light font-inter leading-[14px]">
                {formatTokenAmount(
                  selectedToken?.balance ?? 0n,
                  selectedToken?.decimals
                )}{" "}
                {selectedToken?.symbol}
              </span>
            </div>
          </div>
        </div>
        {errors.amount && (
          <div className="text-error word-break text-xs md:w-[480px] sm:w-full font-normal text-left  font-inter">
            <span>{errors.amount.message}</span>
          </div>
        )}

        {selectedToken && (
          <>
            <div className="flex flex-col gap-2 mt-6 w-full md:w-[480px]">
              <label className="text-gray_text font-normal text-xs font-inter">
                Refund address
              </label>
              <div className="bg-element rounded-xl grow-1 p-3 flex flex-row justify-between items-center gap-7 md:w-[480px] h-12 sm:w-full">
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
                  <span>{errors.refundAddress.message}</span>
                </div>
              )}
            </div>
          </>
        )}
        <DepositAddressSection
          selectedToken={selectedToken}
          strategy={strategy}
          connectedEVMWallet={connectedEVMWallet}
          depositAddress={depositAddress}
          errors={errors}
          debouncedAmountIn={debouncedAmountIn}
        />

        <ActionButtons
          selectedToken={selectedToken}
          strategy={strategy}
          setStrategy={setStrategy}
          connectWallet={connectWallet}
          isConnected={isConnected()}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          connectedEVMWallet={getPublicKey(Network.ARBITRUM) ?? null}
        />
      </form>
    </div>
  );
}
