import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { FC, useEffect, useState } from "react";

import { CHAIN_ICON, CHAIN_TITLE } from "@/lib/1clickHelper";

import { Button } from "@/components/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Network } from "@/config";
import useNetwork from "@/hooks/useNetworkHandler";
import { truncateAddress } from "@/lib/utils";

import { useAppKitAccount } from "@reown/appkit/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletSelector } from "@/providers/near-provider";
import { useTonWallet } from "@tonconnect/ui-react";
import WalletIcon from "@/assets/wallet-icon.svg?react";

type Props = {};

export interface AddressRow {
  address: string | null;
  blockChain: Network;
}
const ConnectWalletDialog: FC<Props> = ({}) => {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const { disconnectWallet, connectWallet } = useNetwork(null);
  const [connectedAddresses, setConnectedAddresses] = useState<AddressRow[]>(
    []
  );
  const [connectors, setConnectors] = useState<{ blockChain: Network }[]>([]);
  const evmAccounts = useAppKitAccount({ namespace: "eip155" });
  const { publicKey } = useWallet();
  const tonWallet = useTonWallet();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (evmAccounts.address) {
      setActiveAddress(evmAccounts.address);

      setConnectedAddresses(
        [
          ...evmAccounts.allAccounts.map((address) => ({
            address: address.address,
            blockChain: Network.ETHEREUM,
          })),
          {
            address: publicKey?.toBase58() ?? null,
            blockChain: Network.SOLANA,
          },
          {
            address: Boolean(accountId) ? accountId : null,
            blockChain: Network.NEAR,
          },
          {
            address: tonWallet?.account?.address ?? null,
            blockChain: Network.TON,
          },
        ].filter((address) => address.address !== null)
      );

      const connectors = [
        !publicKey?.toBase58() ? { blockChain: Network.SOLANA } : null,
        !accountId ? { blockChain: Network.NEAR } : null,
        !tonWallet?.account?.address ? { blockChain: Network.TON } : null,
        !evmAccounts?.address ? { blockChain: Network.ETHEREUM } : null,
      ];
      setConnectors(connectors.filter((connector) => connector !== null));
    }
  }, [
    accountId,
    evmAccounts.address,
    publicKey?.toBase58(),
    tonWallet?.account?.address,
  ]);
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
          {activeAddress ? (
            <>
              <WalletIcon />
              {truncateAddress(activeAddress)}
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex rounded-3xl bg-main_dark !px-0 !pb-0 !pt-0 outline-none border-none  min-w-[480px] ">
        <div className="flex flex-col grow column p-6 gap-5 text-white bg-main_dark rounded-3xl">
          <div className="flex items-center flex-row justify-between h-fit w-full gap-2">
            <div className="justify-center shrink-0 text-white text-base font-semibold font-['Inter'] leading-normal">
              Connected wallets
            </div>
          </div>
          <div className="flex flex-col">
            {connectedAddresses.map((address) => (
              <div
                key={address.address}
                className="self-stretch h-14 py-2 rounded-lg border-main_light inline-flex justify-start items-center gap-2"
              >
                <div className="flex-1 flex justify-between items-center">
                  <div className="size- flex justify-start items-center gap-2">
                    <div className="relative">
                      <img
                        src={
                          CHAIN_ICON[
                            address.blockChain as unknown as TokenResponse.blockchain
                          ]
                        }
                        alt={address.blockChain}
                        width={20}
                        height={20}
                        className="size-10 relative bg-element rounded-full"
                      />
                      <div className="size-2.5 bg-btn_text rounded-full absolute bottom-0 right-0" />
                    </div>
                    <div className="text-center justify-center text-white text-sm font-normal font-['Inter'] leading-none">
                      {truncateAddress(address.address)}
                    </div>
                  </div>
                  <div
                    data-property-1="Default"
                    className="cursor-pointer p-2 bg-element rounded-lg flex justify-center items-center gap-2"
                    onClick={() => {
                      disconnectWallet(address.blockChain);
                    }}
                  >
                    <div className="text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-none">
                      Disconnect
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {connectors.length > 0 && (
            <>
              <div className="flex items-center flex-row justify-between h-fit w-full gap-2">
                <div className="justify-center shrink-0 text-white text-base font-semibold font-['Inter'] leading-normal">
                  Connect wallets
                </div>
              </div>
              <div className="flex flex-col">
                {connectors.map(({ blockChain }) => (
                  <div
                    key={blockChain}
                    className="self-stretch h-14 py-2 rounded-lg border-main_light inline-flex justify-start items-center gap-2"
                  >
                    <div className="flex-1 flex justify-between items-center">
                      <div className="size- flex justify-start items-center gap-2">
                        <div className="relative">
                          <img
                            src={
                              CHAIN_ICON[
                                blockChain as unknown as TokenResponse.blockchain
                              ]
                            }
                            alt={blockChain}
                            width={20}
                            height={20}
                            className="size-10 relative bg-element rounded-full"
                          />
                          <div className="size-2.5 bg-btn_text rounded-full absolute bottom-0 right-0" />
                        </div>
                        <div className="text-center justify-center text-white text-sm font-normal font-['Inter'] leading-none">
                          {
                            CHAIN_TITLE[
                              blockChain as unknown as TokenResponse.blockchain
                            ]
                          }
                        </div>
                      </div>
                      <div
                        data-property-1="Default"
                        className="cursor-pointer p-2 bg-element rounded-lg flex justify-center items-center gap-2"
                        onClick={() => {
                          connectWallet(blockChain);
                        }}
                      >
                        <div className="text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-none">
                          Connect
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConnectWalletDialog;
