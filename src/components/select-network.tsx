import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import { FC, useEffect, useMemo, useState } from 'react';

import { CHAIN_TITLE, CHAIN_ICON, translateNetwork } from '@/lib/1clickHelper';

import { Network, networkChainId } from '@/config';

import { useTokens } from '@/providers/token-context';

import {
  formatTokenAmount,
  isSupportedNetwork,
  truncateAddress,
} from '@/lib/utils';
import { useFormContext } from 'react-hook-form';
import { FormInterface } from '@/lib/validation';
import WalletIcon from '@/assets/wallet-icon.svg?react';
import LogoutIcon from '@/assets/logout-icon.svg?react';
import ArrowRight from '@/assets/arrow-right.svg?react';
import XIcon from '@/assets/close-icon.svg?react';

import { Loader } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { toUserFriendlyAddress, useTonWallet } from '@tonconnect/ui-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletSelector } from '@/providers/near-provider';

import { AddressRow } from './connect-wallet-dialog';

const SelectNetworkDialog: FC<{
  connectWallet: (network: Network) => void;
  disconnectWallet: (network: Network) => void;
  getPublicKey: (network: Network) => string | null | undefined;
}> = ({ connectWallet, getPublicKey, disconnectWallet }) => {
  const { watch, setValue } = useFormContext<FormInterface>();
  const selectedToken = watch('selectedToken');
  const [isFirstDialogOpen, setIsFirstDialogOpen] = useState(false);
  const [isSecondDialogOpen, setIsSecondDialogOpen] = useState(false);
  const { tokens: allTokens } = useTokens();

  const { blockchains, mainTokens } = useMemo(() => {
    const uniqueBlockchains = [
      ...new Set(
        Object.values(allTokens ?? {}).map(({ blockchain }) => blockchain),
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
      .filter((item) => isSupportedNetwork(translateNetwork(item.blockchain)));

    const mainTokens = Object.values(allTokens ?? {}).reduce((acc, token) => {
      if (!acc[token.blockchain]) {
        acc[token.blockchain] = token;
      }
      return acc;
    }, {} as Record<TokenResponse['blockchain'], TokenResponse>);
    return { blockchains, mainTokens };
  }, [allTokens]);

  const walletAddress = useMemo(() => {
    return (
      selectedToken?.blockchain &&
      getPublicKey(translateNetwork(selectedToken?.blockchain))
    );
  }, [selectedToken?.blockchain, getPublicKey]);
  const { isLoading } = useTokenBalance();

  const [connectedAddresses, setConnectedAddresses] = useState<AddressRow[]>(
    [],
  );

  const evmAccounts = useAppKitAccount({ namespace: 'eip155' });
  const { publicKey } = useWallet();
  const tonWallet = useTonWallet();

  const { accountId } = useWalletSelector();

  useEffect(() => {
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
          address: tonWallet?.account?.address
            ? toUserFriendlyAddress(tonWallet?.account?.address)
            : null,
          blockChain: Network.TON,
        },
      ].filter((address) => address.address !== null),
    );
  }, [
    accountId,
    evmAccounts.address,
    publicKey?.toBase58(),
    tonWallet?.account?.address,
  ]);

  return (
    <>
      <div className="flex flex-row gap-2 justify-between w-full rounded-2xl">
        <div className="text-center justify-center flex flex-row items-center gap-2 relative text-main_white text-base font-normal font-['Inter'] leading-normal">
          {!walletAddress ? (
            <>
              <div className="size-3 select-none left-[6px] top-[6px] bg-red-400 rounded-full" />
              <span>Connect Source Wallet</span>
            </>
          ) : (
            <>
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  {formatTokenAmount(
                    selectedToken?.balance ?? 0n,
                    selectedToken?.decimals ?? 0,
                    5,
                  )}
                  <div
                    className="text-center justify-center text-main_light text-base font-semibold font-['Inter'] cursor-pointer"
                    onClick={() =>
                      setValue(
                        'amount',
                        formatTokenAmount(
                          selectedToken?.balance ?? 0n,
                          selectedToken?.decimals ?? 0,
                        ),
                      )
                    }
                  >
                    Max
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-row gap-2 self-end justify-end align-end text-main_light text-sm font-normal font-['Inter']">
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
            <div
              className="text-main text-base font-semibold font-['Inter'] bg-main_light rounded-md px-2 py-1 cursor-pointer"
              onClick={() => setIsFirstDialogOpen(true)}
            >
              Connect
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFirstDialogOpen} onOpenChange={setIsFirstDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          showCloseButton={false}
          className="flex p-4 md:w-[380px] w-full justify-center items-center !border-none  outline-none outline-main_dark flex rounded-2xl !px-0 !pb-0 !pt-0 "
        >
          <div className="flex  !ring-0 !shadow-none !border-none flex-col border-none rounded-2xl outline-none grow  p-6 gap-5">
            <DialogClose className="top-6 right-6 absolute" asChild>
              <button className="cursor-pointer">
                <XIcon className="w-4 h-4 text-main_dark" />
              </button>
            </DialogClose>
            <div className="self-stretch text-center justify-start text-main_white text-xl font-bold font-['Inter'] leading-normal">
              Connected Source Wallets
            </div>
            <div className="self-stretch text-center justify-center text-gray_text text-sm font-normal font-['Inter'] leading-tight">
              Manage your connected wallets: select one to use, or connect
              another.
            </div>
            {connectedAddresses.map((address) => (
              <div
                key={address.address}
                onClick={() => {
                  setValue('refundAddress', address.address ?? '');
                  if (networkChainId[address.blockChain]) {
                    setValue('hyperliquidAddress', address.address ?? '');
                  }
                  setValue('selectedToken', {
                    ...mainTokens[
                      address.blockChain as unknown as TokenResponse.blockchain
                    ],
                    balance: 0n,
                    balanceNear: 0n,
                    balanceUpdatedAt: 0,
                  });
                  setIsFirstDialogOpen(false);
                }}
                className="self-stretch hover:bg-gray-800 h-14 p-2 rounded-lg border-main_light inline-flex justify-start items-center gap-2"
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
                    </div>
                    <div className="text-center justify-center text-white text-sm font-normal font-['Inter'] leading-none">
                      {truncateAddress(address.address)}
                    </div>
                  </div>
                  <div
                    className="cursor-pointer p-2 bg-element rounded-lg flex justify-center items-center gap-2"
                    onClick={() => {
                      disconnectWallet(address.blockChain);
                    }}
                  >
                    <div className="text-center justify-center text-main_white text-sm font-normal font-['Inter'] leading-none">
                      Disconnect
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div
              onClick={() => {
                setIsFirstDialogOpen(false);
                setIsSecondDialogOpen(true);
              }}
              className="flex-1 px-4 py-2.5 bg-main_light rounded-2xl flex justify-center items-center overflow-hidden cursor-pointer"
            >
              <div className="text-center justify-center text-main text-base font-semibold font-['Inter'] leading-normal">
                Connect a New Wallet
              </div>
            </div>
          </div>
          <DialogTitle className="sr-only">Connect Source Wallet</DialogTitle>
        </DialogContent>
      </Dialog>
      <Dialog open={isSecondDialogOpen} onOpenChange={setIsSecondDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          showCloseButton={false}
          className="flex justify-center h-[380px] items-center  md:w-[380px] w-full  !border-none  outline-none outline-main_dark rounded-3xl !px-0 !pb-0 !pt-0"
        >
          <DialogClose className="top-6 right-6 absolute" asChild>
            <button className="cursor-pointer">
              <XIcon className="w-4 h-4 text-main_dark" />
            </button>
          </DialogClose>
          <div className="flex flex-col w-full h-full !ring-0 !shadow-none !border-none rounded-2xl outline-none p-6 gap-5">
            <DialogTitle className="text-white shrink-0 text-center">
              Choose the network your <br />
              Source Wallet is on
            </DialogTitle>
            <DialogDescription className="sr-only" />
            <div className="flex flex-col overflow-y-auto gap-2 flex-grow h-full pr-2">
              {blockchains.map(({ blockchain, title, icon }) => (
                <div
                  key={`${blockchain}-${title}`}
                  className="flex select-none flex-row justify-between items-center hover:bg-element h-14 flex-none px-2 bg-gray-800 rounded-2xl cursor-pointer"
                  onClick={() => {
                    setIsSecondDialogOpen(false);
                    connectWallet(translateNetwork(blockchain));
                    setValue('selectedToken', {
                      ...mainTokens[
                        blockchain as unknown as TokenResponse.blockchain
                      ],
                      balance: 0n,
                      balanceNear: 0n,
                      balanceUpdatedAt: 0,
                    });
                  }}
                >
                  <div className="text-white flex items-center flex-row gap-2 text-sm font-normal font-['Inter']">
                    <img
                      src={icon}
                      alt={title}
                      className="size-9 rounded-full"
                    />
                    {title}
                  </div>
                  <ArrowRight />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectNetworkDialog;
