import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SettingsIcon from "@/assets/settings-icon.svg?react";
import { useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/form-error-icon.svg?react";
import { createSlippageDialogValidationSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SlippageDialog() {
  const slippageOptions = [5, 10, 15, 20];
  const [open, setOpen] = useState(false);
  const { watch: internalWatch, setValue: internalSetValue } = useFormContext();
  const selectedToken = internalWatch("selectedToken");
  const refundAddress = internalWatch("refundAddress");
  const slippageValue = internalWatch("slippageValue");

  const { register, setValue, trigger, formState, handleSubmit } = useForm({
    resolver: zodResolver(
      createSlippageDialogValidationSchema(selectedToken?.blockchain || "evm")
    ),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      slippageValue: slippageValue,
      refundAddress: refundAddress,
    },
  });

  const onSubmit = (data: any) => {
    internalSetValue("slippageValue", data.slippageValue);
    internalSetValue("refundAddress", data.refundAddress);
    setOpen(false);
  };

  const { errors, dirtyFields } = formState;

  useEffect(() => {
    setValue("refundAddress", refundAddress, { shouldDirty: false });
  }, [refundAddress, setValue]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex flex-row gap-2 align-center justify-center cursor-pointer">
          <div className="flex align-center justify-center text-gray_text text-xs font-normal font-['Inter']">
            Advanced Settings
          </div>
          <SettingsIcon className="w-4 h-4" />
        </div>
      </DialogTrigger>
      <DialogContent
        className="border-none outline-none bg-transparent flex justify-center items-center"
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form className="bg-main_dark self-stretch rounded-3xl p-6 inline-flex flex-col justify-start items-start gap-2">
          <div className="w-full">
            <div className=" w-full justify-center text-center text-white text-base font-semibold font-['Inter'] leading-normal">
              Swap Settings
            </div>
          </div>
          <div className="flex flex-col mt-8 gap-2 w-full">
            <div className="self-stretch justify-start text-main_white text-sm font-semibold font-['Inter'] leading-none">
              Slippage Tolerance
            </div>
            <div className="mt-4 justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Set slippage tolerance value
            </div>
            <div className="mt-2 flex flex-row gap-2 h-10 border-element hover:border-main_light focus-within:border-main_light border-2 rounded-xl p-2 w-full">
              <input
                type="number"
                {...register("slippageValue", {
                  valueAsNumber: true,
                })}
                id="slippageValue"
                className="text-base font-normal text-white outline-none leading-6 placeholder:text-muted-foreground grow-1"
              />
              <span className="text-white">%</span>
            </div>
            {errors.slippageValue && (
              <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
                <span>{errors.slippageValue.message?.toString()}</span>
              </div>
            )}
            <div className="flex gap-2">
              {slippageOptions.map((option) => (
                <div
                  className={`size- px-4 py-2 bg-element rounded-3xl inline-flex justify-center items-center gap-2 cursor-pointer ${
                    slippageValue === option ? "bg-main_light" : "bg-element"
                  }`}
                  key={option}
                  onClick={() => {
                    setValue("slippageValue", option);
                    trigger("slippageValue");
                  }}
                >
                  <div className="text-center justify-center text-white text-xs font-normal font-['Inter'] leading-none">
                    {option}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col mt-8 gap-2 w-full">
            <div className="self-stretch justify-start text-main_white text-sm font-semibold font-['Inter'] leading-none">
              Refund Address
            </div>
            <div className="mt-4 justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Your refund address. If the swap fails, your assets will be
              refunded to this address.
            </div>
            <div className="mt-2 flex flex-row gap-2 border-element hover:border-main_light focus-within:border-main_light border-2 rounded-xl w-full">
              <div className="bg-[#1B2429] rounded-xl grow-1 p-2 flex flex-row justify-between items-center gap-7 md:w-[480px] h-10 sm:w-full">
                <div className="flex flex-row grow-1 items-center">
                  <input
                    type="text"
                    {...register("refundAddress")}
                    className="text-white border-none outline-none text-xs font-normal bg-transparent font-inter leading-none w-full"
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
            </div>
            {errors.refundAddress && (
              <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
                <span>{errors.refundAddress.message?.toString()}</span>
              </div>
            )}
          </div>
          <div className="self-stretch inline-flex justify-start items-start mt-4 gap-2">
            <div
              onClick={() => setOpen(false)}
              className="flex-1 self-stretch inline-flex justify-start items-start"
            >
              <div className="flex-1 px-4 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-main_light flex justify-center items-center cursor-pointer">
                <div className="text-center justify-center text-main_light text-sm font-normal font-['DM_Sans'] leading-normal">
                  Cancel
                </div>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex-1  py-2 bg-main_light rounded-[10px] flex justify-center items-center overflow-hidden cursor-pointer"
            >
              <div className="text-center justify-center text-main text-sm font-normal font-['DM_Sans'] leading-normal">
                Apply
              </div>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
