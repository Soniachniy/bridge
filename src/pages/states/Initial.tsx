import SelectTokenDialog from "@/components/select-token-dialog";
import SlippageDialog from "@/components/slippage-dialog";
import { enforcer } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { Spinner } from "@radix-ui/themes";
import { useState } from "react";

import { BridgeFormMachineContext } from "@/providers/machine-provider";

import useSwapQuote from "@/hooks/useSwapQuote";
import { firstStepValidationSchema, FormInterface } from "@/lib/validation";
import { useDebounce } from "@/hooks/useDebounce";
import { ActionButton } from "@/components/ActionButtons";

export const InitialView = () => {
  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  const {
    register,
    setValue,
    watch,
    setError,
    clearErrors,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext();
  const actorRef = BridgeFormMachineContext.useActorRef();

  const selectedToken = watch("selectedToken");
  const amountIn = watch("amount");
  const amountOut = watch("amountOut");
  const slippageValue = watch("slippageValue");
  const hyperliquidAddress = watch("hyperliquidAddress");
  const refundAddress = watch("refundAddress");

  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 500 : 0, [
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

  console.log("errors", errors);

  return (
    <>
      <div className="flex flex-col justify-center items-center mb-10">
        <div className="flex flex-col gap-2 justify-center items-center w-full">
          <div className="flex flex-row gap-2 justify-between md:w-[480px] w-full">
            <div className="text-white font-thin text-sm text-left w-full md:w-[480px]">
              Asset
            </div>
          </div>
          <SelectTokenDialog
            {...register("selectedToken")}
            selectToken={(token) => {
              setValue("selectedToken", token);
              actorRef.send({ type: "select_asset" });
            }}
            selectedToken={selectedToken}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-between w-full md:w-[480px] sm:w-full">
        <span className="text-white font-thin text-sm">Amount</span>
        <SlippageDialog
          slippageValue={slippageValue}
          setSlippageValue={(value) => setValue("slippageValue", value)}
        />
      </div>
      <div className="bg-[#1B2429] w-full rounded-2xl p-3 flex flex-row justify-between items-center gap-7 hover:bg-[#29343a]  h-[75px] md:w-[480px] sm:w-full">
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
          </div>
          <div className="flex flex-row gap-1 justify-between">
            <span className="text-white text-xs font-light font-inter leading-[14px]">
              {isLoading ? (
                <span className="text-white flex flex-row gap-1 items-center text-xs font-light font-inter leading-[14px]">
                  Loading <Spinner size="1" />
                </span>
              ) : amountOut ? (
                <span className="text-white text-xs font-light font-inter leading-[14px]">
                  ≥ {amountOut} USDC at Hyperliquid Perps
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
      {errors.amount && (
        <div className="text-error word-break text-xs md:w-[480px] sm:w-full font-normal text-left  font-inter">
          <span>{errors.amount?.message?.toString()}</span>
        </div>
      )}
      <ActionButton
        variant="primary"
        className="mt-10"
        onClick={async () => {
          const isValid = await trigger([
            "amount",
            "amountOut",
            "selectedToken",
            "platformFee",
            "gasFee",
          ]);
          console.log("isValid", isValid);
          if (isValid) {
            actorRef.send({ type: "proceed" });
          }
        }}
      >
        Next
      </ActionButton>
    </>
  );
};
