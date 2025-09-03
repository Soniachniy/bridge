import { Network } from "@/config";
import useNetwork from "@/hooks/useNetworkHandler";
import { CHAIN_ICON, CHAIN_TITLE, getTokenIcon } from "@/lib/1clickHelper";
import { formatTokenAmount } from "@/lib/utils";
import { getHistory, HistoryTransaction } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import { USDC_DECIMALS } from "@/lib/constants";
import ArrowDown from "@/assets/arrow-down.svg?react";
import ChevronDown from "@/assets/chevron.svg?react";
import { ServerStages, signPermit } from "@/hooks/useProcessing";
import { ActionButton } from "@/components/ActionButtons";
import LoadingIcon from "@/assets/loading-icon.svg?react";
import { queryClient } from "@/providers/evm-provider";

const Status = ({ status }: { status: string }) => {
  if (status === ServerStages.completed) {
    return (
      <div className="size- px-2 py-1 bg-green-500/10 rounded-2xl inline-flex justify-start items-center gap-2">
        <div className="justify-start text-green-500 text-xs font-semibold font-['Inter'] leading-none">
          Success
        </div>
      </div>
    );
  }
  if (status === ServerStages.failed) {
    return (
      <div className="size- px-2 py-1 bg-red-500/10 rounded-2xl inline-flex justify-start items-center gap-2">
        <div className="justify-start text-red-500 text-xs font-semibold font-['Inter'] leading-none">
          Failed
        </div>
      </div>
    );
  }

  return (
    <div className="size- px-2 py-1 bg-orange-400/10 rounded-2xl inline-flex justify-start items-center gap-2">
      <div className="justify-start text-orange-400 text-xs font-semibold font-['Inter'] leading-none">
        Processing
      </div>
    </div>
  );
};

const HistoryCard = ({
  transaction,
  tokens,
  publicKey,
}: {
  transaction: HistoryTransaction;
  tokens: { [key: string]: TokenResponse };
  publicKey: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const date = new Date(transaction.timestamps.createdAt);
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minute =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  return (
    <div className="self-stretch px-4 py-3 bg-[#0F3932] w-full rounded-2xl inline-flex flex-col justify-start items-center gap-3">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
          {year}-{month}-{day} {hour}:{minute} UTC
        </div>
        <div className="flex flex-row items-center gap-4">
          <Status status={transaction.status} />
          <ChevronDown
            className={`size-3 cursor-pointer ${isOpen ? "rotate-180" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            fill="white"
          />
        </div>
      </div>
      {!isOpen ? (
        <div className="flex flex-row items-center gap-4 justify-center w-full">
          <div className="flex flex-row flex-1 gap-2 items-center justify-end">
            <div>
              <div className="relative flex items-center">
                <div className="size-[24px] flex items-center justify-center rounded-full bg-white">
                  <img
                    src={getTokenIcon({
                      assetId: transaction.assetFrom,
                    } as TokenResponse)}
                    alt={transaction.assetFrom ?? "token"}
                    className="size-[24px] rounded-full"
                  />
                </div>

                <img
                  src={CHAIN_ICON[tokens[transaction.assetFrom]?.blockchain]}
                  alt={
                    tokens[transaction.assetFrom]?.blockchain ?? "blockchain"
                  }
                  className="absolute size-[10px] bottom-0 right-0 border border-input-custom rounded-full"
                />
              </div>
            </div>
            <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
              {formatTokenAmount(
                transaction.amountIn ?? 0,
                tokens[transaction.assetFrom]?.decimals
              )}
            </div>
          </div>
          <ArrowDown className="size-5 rotate-270" />
          <div className="flex flex-row flex-1 gap-2 items-center justify-start">
            <div>
              <div className="relative flex items-center">
                <div className="size-[24px] flex items-center justify-center rounded-full bg-white">
                  <img
                    src={getTokenIcon({
                      symbol: "USDC",
                    } as TokenResponse)}
                    alt={"USDC"}
                    className="size-[24px] rounded-full"
                  />
                </div>
                <HyperliquidIcon className="absolute size-[10px] bottom-0 right-0 border border-input-custom rounded-full" />
              </div>
            </div>
            <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
              {formatTokenAmount(transaction.finalAmount ?? 0, USDC_DECIMALS)}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full justify-between">
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset From:
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="relative flex items-center">
                <div className="size-[24px] flex items-center justify-center rounded-full bg-white">
                  <img
                    src={getTokenIcon({
                      assetId: transaction.assetFrom,
                    } as TokenResponse)}
                    alt={transaction.assetFrom ?? "token"}
                    className="size-[24px] rounded-full"
                  />
                </div>

                <img
                  src={CHAIN_ICON[tokens[transaction.assetFrom]?.blockchain]}
                  alt={
                    tokens[transaction.assetFrom]?.blockchain ?? "blockchain"
                  }
                  className="absolute size-[10px] bottom-0 right-0 border border-input-custom rounded-full"
                />
              </div>
              <div className="flex flex-row gap-1 text-center items-end text-main_white text-xs font-semibold font-['Inter'] leading-none">
                {tokens[transaction.assetFrom]?.symbol}
                <span className="text-main_white text-[10px] font-normal font-['Inter']">
                  {CHAIN_TITLE[tokens[transaction.assetFrom]?.blockchain]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Amount to send:
            </div>
            <div className="text-main_white text-xs font-semibold font-['Inter']">
              {formatTokenAmount(
                transaction.amountIn ?? 0,
                tokens[transaction.assetFrom]?.decimals
              )}{" "}
              {tokens[transaction.assetFrom]?.symbol}
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset To:
            </div>
            <div className="flex flex-row items-center gap-2 text-main_white text-xs font-semibold font-['Inter']">
              <div className="flex flex-row gap-2">
                <div className="relative flex items-center">
                  <div className="size-[24px] flex items-center justify-center rounded-full bg-white">
                    <img
                      src={getTokenIcon({
                        symbol: "USDC",
                      } as TokenResponse)}
                      alt={"USDC"}
                      className="size-[24px] rounded-full"
                    />
                  </div>
                  <HyperliquidIcon className="absolute size-[10px] bottom-0 right-0 border border-input-custom rounded-full" />
                </div>
              </div>
              <div className="flex flex-row gap-1 text-center items-end text-main_white text-xs font-semibold font-['Inter'] leading-none">
                USDC
                <span className="text-main_white text-[10px] font-normal font-['Inter']">
                  Hyperliquid
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Amount to receive:
            </div>
            <div className=" text-main_white text-xs font-semibold font-['Inter']">
              {formatTokenAmount(transaction.finalAmount ?? 0, USDC_DECIMALS)}{" "}
              USDC
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Refund address:
            </div>
            <div className="text-main_white text-xs font-semibold font-['Inter']">
              Refund address
            </div>
          </div>
          <div className="flex flex-row items-center w-full justify-between">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Hyperliquid address:
            </div>
            <div className="text-main_white text-xs font-semibold font-['Inter']">
              Hyperliquid address
            </div>
          </div>
        </div>
      )}
      {transaction.status === ServerStages.ready_for_permit && (
        <>
          <ActionButton
            variant="tertiary"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await signPermit(transaction.depositAddress);
              await queryClient.invalidateQueries({
                queryKey: ["history", publicKey ?? ""],
              });
              setLoading(false);
            }}
          >
            {loading ? (
              <LoadingIcon className="animate-spin" fill={"#0F1A20"} />
            ) : (
              "Sign Permit"
            )}
          </ActionButton>
          <div className="justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
            Please confirm the message in your wallet
          </div>
        </>
      )}
    </div>
  );
};

export const History = () => {
  const { isConnected, getPublicKey, connectWallet } = useNetwork(null);
  const tokens = useTokens();
  const { data } = useQuery({
    queryKey: ["history", getPublicKey(Network.ETHEREUM) ?? ""],
    queryFn: () => {
      const address = getPublicKey(Network.ETHEREUM);
      if (!address) {
        return null;
      }
      return getHistory(address);
    },
  });

  return (
    <div className="flex flex-col items-center w-full gap-2 flex-1 relative">
      <div className="text-center justify-start text-main_white text-4xl font-bold font-['Inter']">
        History
      </div>

      {!isConnected(Network.ETHEREUM) ? (
        <div className="flex flex-col flex-1 items-center gap-4 w-full">
          <ActionButton
            variant="secondary"
            className="w-[480px] md:w-full"
            onClick={() => connectWallet(Network.ETHEREUM)}
          >
            Connect Wallet
          </ActionButton>
          <div className="text-center justify-start text-main_white text-sm font-normal font-['Inter']">
            Connect your wallet to view your history
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full md:w-[480px]">
          {data?.data.transactions
            .filter((item) => item.status !== ServerStages.pending_deposit)
            .map((item) => (
              <HistoryCard
                key={item.depositAddress}
                transaction={item}
                publicKey={getPublicKey(Network.ETHEREUM) ?? ""}
                tokens={tokens}
              />
            ))}
        </div>
      )}
    </div>
  );
};
