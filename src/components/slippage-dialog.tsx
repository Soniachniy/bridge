import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { createSlippageDialogValidationSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';

import X from '@/assets/close-icon.svg?react';

export default function SlippageDialog() {
  const slippageOptions = [5, 10, 15, 20];
  const [open, setOpen] = useState(false);
  const { watch: internalWatch, setValue: internalSetValue } = useFormContext();
  const slippageValue = internalWatch('slippageValue');

  const { register, setValue, trigger, formState, handleSubmit, watch } =
    useForm({
      resolver: zodResolver(createSlippageDialogValidationSchema()),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        slippageValue: slippageValue,
      },
    });
  const slippageValueInternal = watch('slippageValue');

  const onSubmit = (data: any) => {
    console.log('data', data);
    internalSetValue('slippageValue', data.slippageValue);
    setOpen(false);
  };

  const { errors } = formState;
  console.log('errors', errors);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="absolute left-0 h-full my-auto">
        <div className="flex flex-row  gap-2 align-center justify-start cursor-pointer">
          <div className="select-none flex align-center justify-center opacity-60 justify-center text-main_light text-sm font-normal font-['Inter'] font-['Inter']">
            Slippage Tolerance {slippageValue}%
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className="border-none outline-none bg-transparent flex justify-center items-center"
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form className="bg-main_dark self-stretch rounded-3xl p-6 inline-flex flex-col justify-start items-start gap-2">
          <div className="flex flex-col gap-2 w-full">
            <DialogClose>
              <X
                color="white"
                className="absolute right-10 top-10 cursor-pointer"
              />
            </DialogClose>

            <div className="select-none self-stretch mb-2 justify-start text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-none">
              Slippage Tolerance
            </div>
            <div className="select-none self-stretch text-center justify-center text-gray_text text-sm font-light font-['Inter'] leading-tight">
              Sometimes prices move while your swap is processing. Slippage
              tolerance defines how much price change you’re okay with before
              the trade fails.
            </div>
            <div className="flex flex-row mt-2 gap-2 w-full">
              <div className="flex grow-1 relative w-24 flex-row gap-2 h-10 border-element hover:border-main_light focus-within:border-main_light border-2 rounded-xl p-2">
                <input
                  type="number"
                  {...register('slippageValue', {
                    valueAsNumber: true,
                  })}
                  id="slippageValue"
                  className="text-base w-full font-normal text-white outline-none leading-6 placeholder:text-muted-foreground"
                />
                <span className="text-white">%</span>
              </div>
              <div className="flex select-none gap-2 align-center items-center justify-center grow-8">
                {slippageOptions.map((option) => (
                  <div
                    className={` px-4 py-[10px] cursor-pointer bg-element hover:bg-zinc-700 active:bg-zinc-700  rounded-3xl inline-flex justify-center items-center gap-2
                      ${
                        slippageValueInternal === option
                          ? 'bg-main_light text-main'
                          : 'bg-element text-white'
                      }`}
                    key={option}
                    onClick={() => {
                      setValue('slippageValue', option);
                      trigger('slippageValue');
                    }}
                  >
                    <div className="text-center justify-center  text-xs font-semibold font-['Inter'] leading-none">
                      {option}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {errors.slippageValue && (
              <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
                <span>{errors.slippageValue.message?.toString()}</span>
              </div>
            )}
          </div>
          <div className="self-stretch inline-flex justify-start items-start mt-4 gap-4">
            <div
              onClick={() => setOpen(false)}
              className="flex-1 self-stretch grow-1 inline-flex justify-start items-start"
            >
              <div className="flex-1 px-4 py-2 rounded-xl outline-offset-[-1px] bg-element hover:bg-gray-600 active:bg-gray-600 flex justify-center items-center cursor-pointer">
                <div className="text-center justify-center text-main_light text-sm font-semibold font-['DM_Sans'] leading-normal">
                  Cancel
                </div>
              </div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex-1 grow-2  py-2 bg-main_light rounded-xl flex justify-center items-center overflow-hidden cursor-pointer"
            >
              <div className="text-center justify-center text-main text-sm font-semibold font-['DM_Sans'] leading-normal">
                Apply
              </div>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
