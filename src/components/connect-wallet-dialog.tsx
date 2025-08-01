import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import { ChevronDown, SearchIcon, X } from "lucide-react";
import { FC, useMemo, useState } from "react";

import { CHAIN_TITLE, CHAIN_ICON, getTokenIcon } from "@/lib/1clickHelper";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {};

const ConnectWalletDialog: FC<Props> = ({}) => {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) return;
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex flex-row  bg-[#97FCE4] text-[#0F1A20] px-4 py-2 rounded-md font-dmSans  items-center border-none gap-2 "
        >
          Connect Wallet
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex rounded-3xl bg-main_dark !px-0 !pb-0 !pt-0 outline-none border-1 min-w-[480px] min-h-[500px]">
        <div className="flex grow column p-6 text-white bg-main_dark rounded-3xl">
          <div className="flex items-center flex-row justify-between h-fit w-full gap-2">
            <div className="justify-center shrink-0 text-white text-base font-semibold font-['Inter'] leading-normal">
              Connect wallet
            </div>

            <div className="flex items-center max-w-[240px] gap-2  bg-main_dark outline-1 outline-main_light p-2 rounded-md border-solid w-full aria-invalid:ring-destructive/20 aria-invalid:border-destructive">
              <SearchIcon className="size-4  text-muted-foreground bg-main_dark hover:outline-main_light" />
              <input
                type="token"
                id="token"
                placeholder="Search token"
                className="text-base font-normal  text-white outline-none leading-6 placeholder:text-muted-foreground  w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!!search && (
                <X
                  className="size-4 cursor-pointer"
                  onClick={() => setSearch("")}
                />
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConnectWalletDialog;
