import { Network } from "@/config";

import { useWalletSelector } from "@/providers/near-provider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";

import { useAppKit } from "@reown/appkit/react";
import { Account } from "@near-wallet-selector/core";

import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import { getBalance } from "wagmi/actions";
import { wagmiAdapter } from "@/providers/evm-provider";
import { tonClient } from "@/providers/ton-provider/ton-utils";
import { Address } from "@ton/core";
import { getSplTokenBalance } from "@/providers/solana-provider/solana-utils";
import { useAppKitAccount } from "@reown/appkit/react";

const useNetwork = (network: Network | null) => {
  const [nearAddress, setNearAddress] = useState<Account | null>(null);
  const { openModal, selector, RPCProvider } = useWalletSelector();
  const { isConnected, address } = useAccount();
  const { publicKey } = useWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { open } = useAppKit();
  const [isNearConnected, setIsNearConnected] = useState(false);
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const eip155Account = useAppKitAccount({ namespace: "eip155" });
  const bip122Account = useAppKitAccount({ namespace: "bip122" });
  console.log(eip155Account, "eip155Account");
  console.log(bip122Account, "bip122Account");
  console.log(solanaAccount, "solanaAccount");
  const tonWallet = useTonWallet();

  const updateIsNearConnected = useCallback(async () => {
    if (selector) {
      try {
        const wallet = await selector.wallet();
        const accounts = await wallet?.getAccounts();
        setNearAddress(accounts?.[0] ?? null);
        setIsNearConnected(accounts && accounts.length > 0);
      } catch (e) {
        console.warn("Error updating near connected", e);
        setIsNearConnected(false);
      }
    }
  }, [selector]);

  useEffect(() => {
    updateIsNearConnected();
  }, [updateIsNearConnected, selector]);

  return {
    isConnected: () => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return isConnected;
        case Network.NEAR:
          return isNearConnected;
        case Network.SOLANA:
          return Boolean(publicKey);
        case Network.TON:
          return Boolean(tonWallet);
        default:
          return false;
      }
    },
    connectWallet: () => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
        case Network.SOLANA:
          return open();
        case Network.NEAR:
          return openModal();
        case Network.TON:
          return tonConnectUI.openModal();
        default:
          return null;
      }
    },
    switchNetwork: () => {
      switch (network) {
        case Network.BASE:
          return console.log("base");
      }
    },
    getPublicKey: () => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return address;
        case Network.SOLANA:
          return solanaAccount.address;
        case Network.NEAR:
          return nearAddress?.accountId;
        case Network.TON:
          return tonWallet?.account?.address;
        default:
          return null;
      }
    },
    getBalance: async (contractAddress?: string) => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          const { value } = await getBalance(wagmiAdapter.wagmiConfig, {
            address: address as `0x${string}`,
            token: contractAddress as `0x${string}`,
          });
          return value;
        case Network.SOLANA:
          return getSplTokenBalance(
            solanaAccount.address as `0x${string}`,
            contractAddress as `0x${string}`
          );
        case Network.NEAR:
          if (!contractAddress) {
            return 0;
          }
          const nearBalance = await RPCProvider.viewFunction(
            "ft_balance_of",
            contractAddress,
            {
              account_id: nearAddress?.accountId,
            }
          );
          return nearBalance;
        case Network.TON:
          if (!tonWallet?.account?.address || !contractAddress) {
            return 0;
          }
          const tonTokenBalance =
            await tonClient.accounts.getAccountJettonBalance(
              Address.parse(tonWallet?.account?.address),
              Address.parse(contractAddress)
            );
          return tonTokenBalance;

        default:
          return null;
      }
    },
  };
};

export default useNetwork;
