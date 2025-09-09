import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Dialog } from "@radix-ui/themes";
import { SearchIcon } from "lucide-react";
import X from "@/assets/close-icon.svg?react";
import { FC, useMemo, useState } from "react";
import ChevronIcon from "@/assets/chevron.svg?react";
import {
  CHAIN_TITLE,
  CHAIN_ICON,
  getTokenIcon,
  translateNetwork,
} from "@/lib/1clickHelper";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LoadingIcon from "@/assets/loading-icon.svg?react";

import { cn, formatTokenAmount, truncateAddress } from "@/lib/utils";
import { useTokens } from "@/providers/token-context";
import { useFormContext } from "react-hook-form";
import { Network } from "@/config";
import Big from "big.js";
import { useTokenBalanceByNetwork } from "@/hooks/useTokenBalance";

type Props = {
  selectedToken: TokenResponse | null;
  selectToken: (token: TokenResponse) => void;
  getPublicKey: (network: Network) => string | null | undefined;
};

const SelectTokenDialog: FC<Props> = ({
  selectToken,
  selectedToken,
  getPublicKey,
}) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<
    TokenResponse.blockchain | undefined
  >(selectedToken?.blockchain);
  const [search, setSearch] = useState("");
  const { tokens: allTokens } = useTokens();
  const { setValue } = useFormContext();

  const { data: balances, isLoading } = useTokenBalanceByNetwork(
    getPublicKey(translateNetwork(selectedBlockchain)) ?? "",
    selectedBlockchain
  );

  const { blockchains } = useMemo(() => {
    const uniqueBlockchains = [
      ...new Set(
        Object.values(allTokens ?? {}).map(({ blockchain }) => blockchain)
      ),
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

    const filteredTokens = Object.values(allTokens ?? {}).filter(
      ({ symbol, blockchain }) => {
        const matchesSearch = lowerSearch
          ? symbol.toLowerCase().includes(lowerSearch)
          : true;
        const matchesNetwork = currentSelectedBlockchains
          ? blockchain === currentSelectedBlockchains
          : true;

        return matchesSearch && matchesNetwork;
      }
    );

    const filteredTokensWithBalance = filteredTokens.map((token) => {
      const internalBalance = formatTokenAmount(
        balances?.[token.contractAddress ?? ""] ?? 0,
        token.decimals
      );
      return {
        ...token,
        balance: internalBalance,
        balanceValue: Big(internalBalance ?? 0)
          .mul(token.price)
          .toFixed(3),
      };
    });

    return filteredTokensWithBalance.sort((a, b) => {
      return Number(b.balance) - Number(a.balance);
    });
  }, [allTokens, search, currentSelectedBlockchains, balances]);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) return;
        setSearch("");
        setSelectedBlockchain(selectedToken?.blockchain);
      }}
    >
      <Dialog.Trigger>
        <Button
          type="button"
          variant="outline"
          className="flex flex-row gap-2 hover:bg-transparent focus:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent outline-none bg-transparent h-auto items-center border-none !py-0 !px-0 "
        >
          {selectedToken ? (
            <div className="relative flex items-center">
              <div className="size-10 flex items-center justify-center rounded-full bg-white">
                <img
                  src={getTokenIcon(selectedToken)}
                  alt={selectedToken?.assetId ?? "token"}
                  className="size-8 rounded-full"
                />
              </div>

              <img
                src={CHAIN_ICON[selectedToken?.blockchain]}
                alt={selectedToken?.blockchain ?? "blockchain"}
                className="absolute size-4 bottom-0 right-0 border border-input-custom rounded-full"
              />
            </div>
          ) : (
            <img src="/empty-state.svg" alt="empty-state" />
          )}

          {selectedToken ? (
            <div className="flex flex-col gap-2 items-start">
              <p className="justify-center text-white text-base font-semibold font-['Inter'] leading-none">
                {selectedToken?.symbol}
              </p>
              <p className="justify-center text-main_white text-xs font-normal opacity-60 font-['Inter'] leading-none">
                {CHAIN_TITLE[selectedToken?.blockchain]}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-start">
              <span className="justify-center text-white text-sm font-normal font-['Inter'] leading-none">
                From
              </span>
              <div className="justify-center text-gray_text text-[10px] font-normal font-['Inter'] leading-none">
                Not Selected
              </div>
            </div>
          )}

          <ChevronIcon color="#97fce4" fill="#97FCE4" className="size-3" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        minWidth={{ initial: "300px", xs: "330px" }}
        minHeight={{ initial: "500px" }}
        className="mt-1 flex justify-center items-center max-w-xs !border-none !outline-none !bg-main_dark flex  !ring-0 !rounded-4xl !px-0 !pb-0 !pt-0"
      >
        <div className="flex  min-h-[500px] flex-col grow p-6  gap-5">
          <Dialog.Close>
            <X
              color="white"
              className="absolute right-5 top-5 cursor-pointer"
            />
          </Dialog.Close>

          <div>
            <Dialog.Title className=" self-stretch text-center text-main_white !text-xl !font-bold font-['Inter'] mb-0">
              Select a Token
            </Dialog.Title>
            <Dialog.Description className="self-stretch text-center justify-center text-gray_text !text-xs font-normal font-['Inter'] mb-4">
              Choose the token you want to swap and the network it will be sent
              from
            </Dialog.Description>
          </div>
          <div className="flex flex-col flex-wrap w-full text-white items-start border-element outline-none bg-main_dark">
            <Label
              htmlFor="network"
              className="text-white text-sm font-normal my-4"
            >
              Select Network
            </Label>
            <div className="flex flex-row flex-wrap gap-2 items-center">
              {blockchains.map(({ blockchain, title, icon }) => (
                <button
                  key={`${blockchain}-${title}`}
                  value={blockchain}
                  onClick={() => {
                    setSelectedBlockchain(blockchain);
                  }}
                  className={cn(
                    "hover:bg-white/20 bg-white/10 rounded-3xl  px-2 py-1 my-1 text-sm",
                    selectedBlockchain === blockchain &&
                      "bg-white hover:bg-white/90 px-2 py-2  my-0 !text-black"
                  )}
                >
                  <div className="flex flex-row gap-2 ">
                    <img
                      src={icon}
                      alt={title}
                      className="size-[22px] rounded-full"
                    />
                    {title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid w-full items-center">
            <Label htmlFor="token" className="text-white mb-2">
              Select Token
            </Label>

            <div className="flex items-center gap-2 bg-main_dark border-1 border-[#458779] active:border-main_light hover:border-main_light p-2 rounded-md  w-full aria-invalid:ring-destructive/20 aria-invalid:border-destructive">
              <SearchIcon className="size-4  text-muted-foreground bg-main_dark hover:outline-main_light" />
              <input
                type="token"
                id="token"
                placeholder="Search token"
                className="text-base font-normal text-white outline-none leading-6 placeholder:text-muted-foreground w-full"
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
                  className="flex flex-row justify-between  py-2 rounded-md gap-4 hover:bg-element pr-2"
                  onClick={() => {
                    const address = getPublicKey(
                      translateNetwork(token.blockchain)
                    );
                    if (address) {
                      setValue("refundAddress", address);
                    } else {
                      setValue("refundAddress", "");
                    }
                    selectToken(token);
                  }}
                >
                  <div className="flex flex-row gap-2 items-center">
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
                  </div>
                  {!isLoading ? (
                    <div className="flex flex-col gap-1 items-end">
                      {token.balance && (
                        <>
                          <div className="text-white text-base font-semibold font-['Inter'] leading-none">
                            {token.balance}
                          </div>
                          <div className="opacity-60 text-right justify-center text-main_white text-xs font-normal font-['Inter'] leading-none">
                            ${token.balanceValue}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 items-end">
                      <LoadingIcon
                        className="animate-spin size-4"
                        fill={"white"}
                      />
                    </div>
                  )}
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
