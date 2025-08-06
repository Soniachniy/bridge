import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SettingsIcon from "@/assets/settings-icon.svg?react";
import { useState } from "react";

export default function SlippageDialog({
  slippageValue,
  setSlippageValue,
}: {
  slippageValue: number;
  setSlippageValue: (value: number) => void;
}) {
  const [localSlippageValue, setLocalSlippageValue] = useState(slippageValue);
  const slippageOptions = [5, 10, 15, 20];
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <SettingsIcon className="size-6 cursor-pointer" />
      </DialogTrigger>
      <DialogContent
        className="border-none outline-none bg-transparent"
        showCloseButton={false}
      >
        <div className="bg-main_dark self-stretch rounded-3xl p-6 inline-flex flex-col justify-start items-start gap-2">
          <div className="w-full">
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className=" w-full justify-center text-center text-white text-base font-semibold font-['Inter'] leading-normal">
                  Slippage
                </div>
              </div>
              <div className="self-stretch text-center justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
                Set the maximum amount
              </div>
            </div>
          </div>
          <input
            type="token"
            id="token"
            placeholder="Search token"
            className="text-base font-normal border-element hover:border-main_light border-2 rounded-xl p-2 text-white outline-none leading-6 placeholder:text-muted-foreground  w-full"
            value={localSlippageValue}
            onChange={(e) => setLocalSlippageValue(Number(e.target.value))}
          />
          <div className="flex justify-between gap-2">
            {slippageOptions.map((option) => (
              <div
                className={`size- px-4 py-2 bg-element rounded-3xl inline-flex justify-center items-center gap-2 cursor-pointer ${
                  slippageValue === option ? "bg-main_light" : "bg-element"
                }`}
                onClick={() => setLocalSlippageValue(option)}
              >
                <div className="text-center justify-center text-white text-xs font-normal font-['Inter'] leading-none">
                  {option}%
                </div>
              </div>
            ))}
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
            <div
              onClick={() => {
                setSlippageValue(localSlippageValue);
                setOpen(false);
              }}
              className="flex-1  py-2 bg-main_light rounded-[10px] flex justify-center items-center overflow-hidden cursor-pointer"
            >
              <div className="text-center justify-center text-main text-sm font-normal font-['DM_Sans'] leading-normal">
                Apply
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
