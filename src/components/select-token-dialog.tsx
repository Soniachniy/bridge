import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Dialog } from "@radix-ui/themes";
import { ChevronDown, SearchIcon, X } from "lucide-react";
import { FC, useMemo, useState } from "react";

import {
  CHAIN_TITLE,
  TOKEN_ICON_BY_DEFUSE_ASSET_ID,
  CHAIN_ICON,
} from "@/lib/1clickHelper";

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

type Props = {
  allTokens: TokenResponse[];
  selectedToken: TokenResponse | null;
  selectToken: (token: TokenResponse) => void;
};

const SelectTokenDialog: FC<Props> = ({
  allTokens,
  selectToken,
  selectedToken,
}) => {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<TokenResponse.blockchain>();
  const [search, setSearch] = useState("");

  const { blockchains } = useMemo(() => {
    const uniqueBlockchains = [
      ...new Set(allTokens?.map(({ blockchain }) => blockchain)),
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
      .filter((item) => !!item);

    return { blockchains };
  }, [allTokens]);

  const currentSelectedBlockchains =
    blockchains.length === 1 ? blockchains[0]?.blockchain : selectedBlockchain;

  const filteredTokens = useMemo(() => {
    const lowerSearch = search?.toLowerCase();
    return allTokens?.filter(({ symbol, blockchain }) => {
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
          className="flex flex-row gap-2 bg-[#1B2429] rounded-2xl p-4 h-auto items-center border-none gap-2  w-[480px] "
        >
          {selectedToken ? (
            <div className="relative">
              <img
                src={
                  TOKEN_ICON_BY_DEFUSE_ASSET_ID[selectedToken.assetId] ??
                  "/static/icons/empty.svg"
                }
                alt={selectedToken?.symbol ?? "token"}
                className="size-7 rounded-full"
              />
              <img
                src={CHAIN_ICON[selectedToken?.blockchain]}
                alt={selectedToken?.blockchain ?? "blockchain"}
                className="absolute size-4 -bottom-1 -right-1 border border-white rounded-full"
              />
            </div>
          ) : (
            <img src="/src/assets/empty-state.svg" alt="empty-state" />
          )}

          {selectedToken ? (
            <div className="flex-1 ml-2">
              <p className="text-left text-sm font-semibold leading-[120%] tracking-[-0.32px] max-w-14 truncate md:max-w-full md:whitespace-normal">
                {selectedToken?.symbol}
              </p>
              <p className="text-left text-muted-foreground text-[10px] font-medium leading-[120%]">
                {selectedToken?.blockchain}
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
        className="mt-1 md:mr-[48px] max-w-xs dark:bg-black-800 rounded-2xl !px-0 !pb-0"
      >
        <div className="flex flex-col gap-5">
          <Dialog.Title className="px-3">Select Token & Network</Dialog.Title>
          <Dialog.Description className="sr-only" />
          <div className="grid w-full items-center gap-1.5 px-3">
            <Label htmlFor="network">Select Network</Label>
            <Select
              onValueChange={(val) =>
                setSelectedBlockchain(val as TokenResponse.blockchain)
              }
              value={currentSelectedBlockchains}
              disabled={blockchains.length === 1}
            >
              <SelectTrigger className="w-full min-h-[42px]">
                <SelectValue
                  id="network"
                  placeholder="Select Network"
                  className="text-sm font-medium leading-5"
                />
              </SelectTrigger>
              <SelectContent>
                {blockchains.map(({ blockchain, title, icon }) => (
                  <SelectItem key={blockchain} value={blockchain}>
                    <img
                      src={icon}
                      alt={title}
                      className="size-[22px] rounded-full"
                    />
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5 px-3">
            <Label htmlFor="token">Select Token</Label>

            <div className="flex items-center gap-2 border border-border bg-background p-2 rounded-md border-solid w-full aria-invalid:ring-destructive/20 aria-invalid:border-destructive">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                type="token"
                id="token"
                placeholder="Search token"
                className="text-base font-normal leading-6 placeholder:text-muted-foreground outline-none w-full"
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
            <div className="flex flex-col overflow-y-auto max-h-80 px-3 pb-3">
              {filteredTokens.map((token) => (
                <Button
                  key={token.assetId}
                  variant="ghost"
                  size="nosize"
                  className="justify-start px-3 py-2 rounded-md gap-4"
                  onClick={() => selectToken(token)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        TOKEN_ICON_BY_DEFUSE_ASSET_ID[token.assetId] ??
                        "/static/icons/empty.svg"
                      }
                      alt={token?.symbol ?? "token"}
                      className="size-10 rounded-full"
                    />
                    <img
                      src={CHAIN_ICON[token?.blockchain]}
                      alt={token?.blockchain ?? "blockchain"}
                      className="absolute size-4 -bottom-0.5 -right-0.5 shrink-0 border border-white rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-left text-base font-semibold leading-[120%]">
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
