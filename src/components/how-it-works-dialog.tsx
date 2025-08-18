import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FC } from "react";

import QuestionMarkIcon from "@/assets/question-icon.svg?react";
import { XIcon } from "lucide-react";

const HowItWorksDialog: FC = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="flex flex-row gap-2 justify-center align-center text-main_light text-sm font-normal font-['Inter'] ">
          <div className="flex flex-row gap-2 justify-center align-center">
            <span className="hidden text-center justify-center text-main_white text-base font-normal font-['Inter'] sm:flex">
              How it works
            </span>
            <QuestionMarkIcon className="w-4 h-4 self-center" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex  justify-center items-center md:w-[480px] w-full mt-1 md:mr-[48px] !border-none  max-w-xs outline-none outline-main_dark bg-main_dark flex rounded-2xl !px-0 !pb-0 !pt-0 "
      >
        <DialogClose className=" top-6 right-6 absolute" asChild>
          <button>
            <XIcon className="w-4 h-4 text-main_dark" stroke="#fff" />
          </button>
        </DialogClose>
        <div className="flex md:w-[480px] w-full !ring-0 !shadow-none !border-none flex-col border-none rounded-2xl outline-none grow bg-main_dark p-6 gap-5">
          <DialogTitle className="text-white text-center">
            How it works
          </DialogTitle>

          <DialogDescription className="sr-only" />
          <div className="grid w-full text-white items-center border-element focus:outline-none focus:ring-0 focus:border-element active:outline-none active:ring-0 active:border-none outline-none bg-main_dark">
            <div className="self-stretch flex flex-col justify-start items-center gap-6">
              <div className="self-stretch flex w-full flex-col justify-start items-start gap-2">
                <div className="text-center w-full justify-start text-main_white text-center text-xs font-normal font-['Inter'] leading-none">
                  Fast & Gasless Deposits to Hyperliquid
                </div>
              </div>
              <div className="self-stretch justify-start text-main_white text-sm font-normal font-['Inter'] leading-tight">
                1. Choose the chain and asset you’re selling — target USDC on
                Hyperliquid.
              </div>
              <div className="self-stretch justify-start text-main_white text-sm font-normal font-['Inter'] leading-tight">
                2. Connect your EVM wallet (Arbitrum is added automatically).
              </div>
              <div className="self-stretch justify-start text-main_white text-sm font-normal font-['Inter'] leading-tight">
                3. Transfer the asset
              </div>
              <div className="self-stretch px-4 inline-flex justify-center items-center gap-2.5">
                <ul className="list-disc list-inside text-gray_text text-sm font-normal font-['Inter']">
                  <li>Sign the transaction from your connected wallet, or</li>
                  <li>
                    Select Manual Send, copy the deposit address, and add a
                    refund address.
                  </li>
                </ul>
              </div>
              <div className="self-stretch justify-start text-main_white text-sm font-normal font-['Inter'] leading-tight">
                4. We swap the asset to USDC on Arbitrum.
              </div>
              <div className="self-stretch justify-start text-main_white text-sm font-normal font-['Inter'] leading-tight">
                5. Sign the permit — USDC is credited to your Hyperliquid
                account. No ETH needed.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksDialog;
