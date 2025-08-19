import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FC, useMemo, useState } from "react";

import { CHAIN_TITLE, CHAIN_ICON, translateNetwork } from "@/lib/1clickHelper";
import InfoIcon from "@/assets/warning-icon.svg?react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Network } from "@/config";

import { useTokens } from "@/providers/token-context";

import { isSupportedNetwork, truncateAddress } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { FormInterface } from "@/lib/validation";
import WalletIcon from "@/assets/wallet-icon.svg?react";
import LogoutIcon from "@/assets/logout-icon.svg?react";
import { EStrategy } from "@/pages/Form";
import { XIcon } from "lucide-react";

const SelectNetworkDialog: FC<{
  connectWallet: (network: Network) => void;
  disconnectWallet: (network: Network) => void;
  getPublicKey: (network: Network) => string | null | undefined;
}> = ({ connectWallet, getPublicKey, disconnectWallet }) => {
  const { watch, setValue } = useFormContext<FormInterface>();
  const selectedToken = watch("selectedToken");
  const [open, setOpen] = useState(false);

  const allTokens = useTokens();

  const { blockchains, mainTokens } = useMemo(() => {
    const uniqueBlockchains = [
      ...new Set(Object.values(allTokens).map(({ blockchain }) => blockchain)),
    ];

    const blockchains: {
      blockchain: TokenResponse.blockchain;
      icon: string;
      title: string;
    }[] = uniqueBlockchains
      .map((blockchain) => {
        return {
          blockchain,
          icon: CHAIN_ICON[blockchain],
          title: CHAIN_TITLE[blockchain],
        };
      })
      .filter((item) => isSupportedNetwork(translateNetwork(item.blockchain)));

    const mainTokens = Object.values(allTokens).reduce((acc, token) => {
      if (!acc[token.blockchain]) {
        acc[token.blockchain] = token;
      }
      return acc;
    }, {} as Record<TokenResponse["blockchain"], TokenResponse>);
    return { blockchains, mainTokens };
  }, [allTokens]);

  const walletAddress = useMemo(() => {
    return (
      selectedToken?.blockchain &&
      getPublicKey(translateNetwork(selectedToken?.blockchain))
    );
  }, [selectedToken?.blockchain, getPublicKey]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (selectedToken) {
          setOpen(false);
          connectWallet(translateNetwork(selectedToken?.blockchain));
          setValue("strategy", EStrategy.Wallet);
          return;
        }
        setOpen(open);
      }}
    >
      <DialogTrigger>
        <div className="flex flex-row gap-2 justify-center align-center text-main_light text-sm font-normal font-['Inter'] underline">
          {walletAddress ? (
            <div className="flex flex-row gap-2 justify-center align-center">
              <WalletIcon fill="#97fce4" className="self-center" />
              {truncateAddress(walletAddress)}
              <LogoutIcon
                onClick={() =>
                  disconnectWallet(translateNetwork(selectedToken?.blockchain))
                }
                className="w-4 h-4 self-center"
              />
            </div>
          ) : (
            <>
              Connect Source Wallet{" "}
              <InfoIcon stroke="#97fce4" className="w-4 h-4 self-center" />
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex justify-center items-center w-[480px] md:w-full mt-1 md:mr-[48px] !border-none  max-w-xs outline-none outline-main_dark bg-main_dark flex rounded-2xl !px-0 !pb-0 !pt-0 "
      >
        <DialogClose className=" top-6 right-6 absolute" asChild>
          <button>
            <XIcon className="w-4 h-4 text-main_dark" stroke="#fff" />
          </button>
        </DialogClose>
        <div className="flex w-[480px] md:w-full !ring-0 !shadow-none !border-none flex-col border-none rounded-2xl outline-none grow bg-main_dark p-6 gap-5">
          <DialogTitle className="text-white">
            Select Chain before connect wallet
          </DialogTitle>
          <DialogDescription className="sr-only" />
          <div className="grid w-full text-white items-center border-element focus:outline-none focus:ring-0 focus:border-element active:outline-none active:ring-0 active:border-none outline-none bg-main_dark">
            <Label htmlFor="network" className="text-white mb-2">
              Select Network
            </Label>
            <Select
              onValueChange={(val) => {
                connectWallet(translateNetwork(val));
                setOpen(false);
                setValue("selectedToken", {
                  ...mainTokens[val as TokenResponse["blockchain"]],
                  balance: 0n,
                  balanceNear: 0n,
                  balanceUpdatedAt: 0,
                });
                setValue("strategy", EStrategy.Wallet);
              }}
            >
              <SelectTrigger className="w-full border-1 border-element border-solid hover:border-1  hover:border-element outline-none text-black min-h-[42px] border-1 border-element hover:border-main_light focus:outline-none  focus:ring-offset-0 active:ring-offset-0 focus-within:ring-offset-0 bg-main_dark text-white">
                <SelectValue
                  id="network"
                  asChild
                  placeholder="Select Network"
                  className="text-sm font-medium focus-within:border-main_light outline-none bg-main_dark leading-5 border-10"
                >
                  Select Network
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-main_dark text-white ">
                {blockchains.map(({ blockchain, title, icon }) => (
                  <SelectItem
                    key={`${blockchain}-${title}`}
                    value={blockchain}
                    className="hover:bg-element"
                  >
                    <div className="text-white flex flex-row gap-2 ">
                      <img
                        src={icon}
                        alt={title}
                        className="size-[22px] rounded-full"
                      />
                      {title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectNetworkDialog;
