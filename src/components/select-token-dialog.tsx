import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Dialog } from "@radix-ui/themes";
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

import { truncateAddress } from "@/lib/utils";
import { useTokens } from "@/providers/token-context";

type Props = {
  selectedToken: TokenResponse | null;
  selectToken: (token: TokenResponse) => void;
};

const SelectTokenDialog: FC<Props> = ({ selectToken, selectedToken }) => {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<TokenResponse.blockchain>();
  const [search, setSearch] = useState("");
  const allTokens = useTokens();

  const { blockchains } = useMemo(() => {
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
      .filter((item) => !!item)
      .filter((item) => item.icon);

    return { blockchains };
  }, [allTokens]);

  const currentSelectedBlockchains =
    blockchains.length === 1 ? blockchains[0]?.blockchain : selectedBlockchain;

  const filteredTokens = useMemo(() => {
    const lowerSearch = search?.toLowerCase();
    return Object.values(allTokens).filter(({ symbol, blockchain }) => {
      const matchesSearch = lowerSearch
        ? symbol.toLowerCase().includes(lowerSearch)
        : true;
      const matchesNetwork = currentSelectedBlockchains
        ? blockchain === currentSelectedBlockchains
        : true;

      return matchesSearch && matchesNetwork;
    });
  }, [allTokens, search, currentSelectedBlockchains]);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) return;
        setSelectedBlockchain(undefined);
        setSearch("");
      }}
    >
      <Dialog.Trigger>
        <Button
          type="button"
          variant="outline"
          className="flex flex-row gap-2 bg-[#1B2429] w-full rounded-2xl p-4 h-auto items-center border-none gap-2  md:w-[480px] sm:w-full"
        >
          {selectedToken ? (
            <div className="relative h-[55px] flex items-center">
              <img
                src={getTokenIcon(selectedToken)}
                alt={selectedToken?.assetId ?? "token"}
                className="size-12 rounded-full"
              />
              <img
                src={CHAIN_ICON[selectedToken?.blockchain]}
                alt={selectedToken?.blockchain ?? "blockchain"}
                className="absolute size-4 -bottom-1 -right-1 border border-white rounded-full"
              />
            </div>
          ) : (
            <img src="/empty-state.svg" alt="empty-state" />
          )}

          {selectedToken ? (
            <div className="flex-1 flex-col ml-2">
              <p className="text-left mb-2 text-main_white text-base font-semibold font-['Inter'] leading-normal">
                {selectedToken?.symbol}
              </p>
              <p className="text-left text-main_white text-xs font-normal font-['Inter'] leading-none">
                {CHAIN_TITLE[selectedToken?.blockchain]}
              </p>
            </div>
          ) : (
            <>
              <span className="grow-2 size-base text-white text-sm font-light">
                Select chain and token
              </span>
            </>
          )}

          <ChevronDown color="white" className="w-4 h-4 " />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        minWidth={{ initial: "300px", xs: "330px" }}
        minHeight={{ initial: "500px" }}
        className="mt-1 md:mr-[48px] max-w-xs border-none outline-none bg-main_dark  flex rounded-2xl !px-0 !pb-0 !pt-0"
      >
        <div className="flex flex-col border-none outline-none grow bg-main_dark  p-6  gap-5">
          <Dialog.Title className="text-white">
            Select Token & Network
          </Dialog.Title>
          <Dialog.Description className="sr-only" />
          <div className="grid w-full text-white items-center border-element  focus:outline-none focus:ring-0 focus:border-element active:outline-none active:ring-0 active:border-none outline-none bg-main_dark">
            <Label htmlFor="network" className="text-white mb-2">
              Select Network
            </Label>
            <Select
              onValueChange={(val) =>
                setSelectedBlockchain(val as TokenResponse.blockchain)
              }
              value={currentSelectedBlockchains}
              disabled={blockchains.length === 1}
            >
              <SelectTrigger className="w-full border-1 border-element border-solid hover:border-1  hover:border-element outline-none text-black min-h-[42px] border-1 border-element hover:border-main_light focus:outline-none  focus:ring-offset-0 active:ring-offset-0 focus-within:ring-offset-0 bg-main_dark text-white">
                <SelectValue
                  id="network"
                  asChild
                  placeholder="Select Network"
                  className="text-sm font-medium focus-within:border-main_light outline-none bg-main_dark leading-5 border-10"
                >
                  {selectedBlockchain && (
                    <div className="text-white flex flex-row gap-2 ">
                      <img
                        src={CHAIN_ICON[selectedBlockchain]}
                        alt={selectedBlockchain ?? "blockchain"}
                        className="size-[22px] rounded-full"
                      />
                      {CHAIN_TITLE[selectedBlockchain]}
                    </div>
                  )}
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

          <div className="grid w-full items-center">
            <Label htmlFor="token" className="text-white mb-2">
              Select Token
            </Label>

            <div className="flex items-center gap-2  bg-main_dark outline-1 outline-element hover:outline-main_light focus-within:outline-main_light focus:outline-main_light p-2 rounded-md border-solid w-full aria-invalid:ring-destructive/20 aria-invalid:border-destructive">
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

          <Dialog.Close>
            <div className="flex flex-col overflow-y-auto max-h-80  pb-3">
              {filteredTokens.map((token) => (
                <Button
                  key={`${token.assetId}-${token.blockchain}-${token.symbol}`}
                  variant="ghost"
                  size="nosize"
                  className="justify-start  py-2 rounded-md gap-4 hover:bg-element"
                  onClick={() => selectToken(token)}
                >
                  <div className="relative shrink-0 mx-2  ">
                    <img
                      src={getTokenIcon(token) ?? "/static/icons/empty.svg"}
                      alt={token?.assetId ?? "token"}
                      className="size-10 rounded-full"
                    />
                    <img
                      src={CHAIN_ICON[token?.blockchain]}
                      alt={token?.blockchain ?? "blockchain"}
                      className="absolute size-4 -bottom-0.5 -right-0.5 shrink-0 border border-white rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-left text-base text-white font-semibold leading-[120%]">
                      {token.symbol}
                    </p>
                    <p className="text-left text-muted-foreground text-sm font-normal leading-[120%]">
                      {truncateAddress(token.contractAddress)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SelectTokenDialog;
