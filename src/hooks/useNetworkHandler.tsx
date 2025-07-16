import { Network } from "@/config";

import { useWalletSelector } from "@/providers/near-provider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { useAppKit } from "@reown/appkit/react";

import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";

const useNetwork = (network: Network | null) => {
  const { openModal, selector } = useWalletSelector();
  const { isConnected } = useAccount();
  const { setVisible } = useWalletModal();
  const { publicKey } = useWallet();

  const { open } = useAppKit();
  const [isNearConnected, setIsNearConnected] = useState(false);

  const tonWallet = useTonWallet();

  const updateIsNearConnected = useCallback(async () => {
    if (selector) {
      try {
        const wallet = await selector.wallet();
        const accounts = await wallet?.getAccounts();
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
          return <TonConnectButton />;
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
  };
};

export default useNetwork;
