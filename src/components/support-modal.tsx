import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import SupportIcon from "@/assets/support.svg?react";
import X from "@/assets/close-icon.svg?react";
import LinkIcon from "@/assets/link-icon.svg?react";

import CopyIcon from "@/assets/copy-icon.svg?react";
import { FormInterface } from "@/lib/validation";
import { useFormContext } from "react-hook-form";
import { ActionButton } from "./ActionButtons";

const getAddressToShow = (
  depositAddress?: string,
  refundAddress?: string,
  hyperliquidAddress?: string
) => {
  if (depositAddress) {
    return { type: "deposit", address: depositAddress };
  }
  if (refundAddress) {
    return { type: "refund", address: refundAddress };
  }
  if (hyperliquidAddress) {
    return { type: "hyperliquid", address: hyperliquidAddress };
  }
  return { type: "none", address: "" };
};

export const SupportModal = () => {
  const { watch } = useFormContext<FormInterface>();
  const depositAddress = watch("depositAddress");
  const refundAddress = watch("refundAddress");
  const hyperliquidAddress = watch("hyperliquidAddress");

  const addressToShow = getAddressToShow(
    depositAddress,
    refundAddress,
    hyperliquidAddress
  );

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-row gap-2 justify-center align-center cursor-pointer">
            <span className="hidden text-center justify-center text-main_white text-base font-semibold font-['Inter'] sm:flex">
              Support
            </span>
            <SupportIcon className="w-5 h-5 self-center" />
          </div>
        </DialogTrigger>
        <DialogContent
          className="border-none !w-full sm:!max-w-100px outline-none bg-main_dark rounded-4xl flex flex-col gap-6 justify-center items-center"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className=" text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
              Contact Support
            </DialogTitle>
            <DialogClose>
              <X
                color="white"
                className="absolute right-5 top-5 cursor-pointer"
              />
            </DialogClose>
          </DialogHeader>

          {addressToShow?.address.length > 0 ? (
            <>
              <DialogDescription className="text-center text-gray_text text-sm font-normal font-['Inter']">
                We'll redirect you to our official Telegram support. <br /> To
                help resolve your issue faster, share your{" "}
                <span className="font-bold">{addressToShow?.type}</span> address
                with the support team.
              </DialogDescription>
              <div className="h-12 px-4 py-3 rounded-xl w-full outline outline-1 outline-offset-[-1px] outline-teal-200/40 inline-flex justify-between items-center">
                <div className="justify-center w-full overflow-hidden whitespace-nowrap text-ellipsis text-main_white text-base font-semibold font-['Inter'] leading-none">
                  {addressToShow?.address}
                </div>
                <CopyIcon
                  className="size-6 cursor-pointer relative"
                  onClick={() => {
                    navigator.clipboard.writeText(addressToShow?.address ?? "");
                  }}
                />
              </div>
            </>
          ) : (
            <DialogDescription className="text-center text-gray_text text-sm font-normal font-['Inter']">
              You'll be redirected to our official Telegram support. <br /> For
              account identification and transaction-related issues, you'll need
              to provide your wallet address directly to the support agent.
            </DialogDescription>
          )}
          <div className="flex flex-row gap-2 w-full">
            <DialogClose asChild>
              <ActionButton variant="secondary" className="flex-1">
                Back
              </ActionButton>
            </DialogClose>

            <ActionButton
              variant="primary"
              className="flex-5"
              onClick={() => {
                window.open("https://t.me/hyperdep", "_blank");
              }}
            >
              Open Telegram Support <LinkIcon className="size-4" />
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
