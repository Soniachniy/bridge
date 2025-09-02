import { useFormContext } from "react-hook-form";

import { FormInterface } from "@/lib/validation";
import { BridgeFormMachineContext } from "@/providers/machine-provider";
import LinkIcon from "@/assets/link-icon.svg?react";
import SuccessIcon from "@/assets/success-icon.svg?react";

export const SuccessScreen = () => {
  const { watch } = useFormContext<FormInterface>();
  const amountOut = watch("amountOut");

  const actorRef = BridgeFormMachineContext.useActorRef();

  const goToMainPage = () => {
    actorRef.send({ type: "back_to_asset_selection" });
  };

  return (
    <div className="size- px-4 pt-6 pb-8 bg-teal-950 rounded-[48px] shadow-[0px_24px_48px_0px_rgba(0,30,25,1.00)] inline-flex flex-col justify-start items-center gap-8">
      <SuccessIcon className="size-16 relative" />
      <div className="w-[490px] flex flex-col justify-start items-center gap-2">
        <div className="w-[490px] text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
          Deposit Successfully Completed
        </div>
        <div className="w-[490px] text-gray_text text-sm font-normal font-['Inter'] leading-tight text-center justify-center">
          Deposit of{" "}
          <span className="text-gray_text text-sm font-bold font-['Inter'] leading-tight">
            {amountOut} USDC
          </span>{" "}
          to Hyperliquid successfully completed
        </div>
      </div>
      <div className="w-[458px] flex flex-col justify-start items-center gap-6">
        <div className="self-stretch inline-flex justify-center items-start gap-6">
          <a
            href={`https://app.hyperliquid.xyz`}
            target="_blank"
            className="h-14 px-4 py-3 bg-teal-200/10 text-main_light text-base font-semibold font-['Inter'] cursor-pointer rounded-2xl flex justify-center items-center gap-1 overflow-hidden"
          >
            Go to Hyperliquid
            <LinkIcon className="size-6 self-center" />
          </a>
          <div
            onClick={goToMainPage}
            className="flex-1 h-14 px-4 py-3 bg-main_light cursor-pointer rounded-2xl flex justify-center items-center overflow-hidden"
          >
            <div className="text-center justify-center text-main text-base font-semibold font-['Inter'] leading-normal">
              Return to Main Page
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
