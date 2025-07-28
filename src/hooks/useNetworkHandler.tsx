import { basicConfig, Network } from "@/config";

import {
  convertGas,
  ONE_YOCTO,
  useWalletSelector,
} from "@/providers/near-provider";
import { useAccount } from "wagmi";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
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

import {
  prepareTransactionRequest,
  sendTransaction,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { encodeFunctionData, erc20Abi, parseEther, parseUnits } from "viem";
import Big from "big.js";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { parseTokenAmount } from "@/lib/utils";
import { getOrCreateAssociatedTokenAccount } from "@/providers/solana-provider";

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
  const solanaWallet = useAnchorWallet();

  const solanaConnection = new Connection(basicConfig.solanaConfig.endpoint);

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
    makeDeposit: async (
      selectedToken: TokenResponse,
      depositAddress: string,
      amount: string,
      decimals: number
    ) => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          const request = await prepareTransactionRequest(
            wagmiAdapter.wagmiConfig,
            {
              to: selectedToken.contractAddress as `0x${string}`,
              value: parseEther(amount),
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: [
                  depositAddress as `0x${string}`,
                  parseUnits(amount, decimals),
                ],
              }),
            }
          );
          const hash = await sendTransaction(wagmiAdapter.wagmiConfig, request);
          const status = await waitForTransactionReceipt(
            wagmiAdapter.wagmiConfig,
            { hash }
          );
          return status.status === "success";
        case Network.SOLANA:
          const tx = new Transaction();
          if (!selectedToken.contractAddress || !solanaAccount.address) {
            return false;
          }
          let sourceAccount = await getAssociatedTokenAddress(
            new PublicKey(selectedToken.contractAddress),
            new PublicKey(solanaAccount.address),
            false,
            new PublicKey(solanaAccount.address)
          );
          let {
            status: isAccountCreated,
            account: solanaDestinationAccount,
            instruction,
          } = await getOrCreateAssociatedTokenAccount(
            solanaConnection,
            new PublicKey(selectedToken.contractAddress),
            new PublicKey(solanaAccount.address),
            false,
            solanaAccount.address
          );
          if (!isAccountCreated && instruction) {
            tx.add(instruction);
            solanaDestinationAccount = await getAssociatedTokenAddress(
              new PublicKey(selectedToken.contractAddress),
              new PublicKey(solanaAccount.address),
              false,
              new PublicKey(solanaAccount.address)
            );
          }
          if (!solanaDestinationAccount) {
            console.log("solanaDestinationAccount not found");
            return false;
          }
          tx.add(
            createTransferInstruction(
              new PublicKey(solanaAccount.address),
              new PublicKey(solanaDestinationAccount),
              new PublicKey(solanaAccount.address),
              BigInt(parseTokenAmount(amount, selectedToken.decimals))
            )
          );
          const latestBlockHash = await solanaConnection.getLatestBlockhash(
            "confirmed"
          );
          tx.recentBlockhash = await latestBlockHash.blockhash;
          const txHash = await sendAndConfirmTransaction(
            solanaConnection,
            tx,
            []
          );
          console.log(txHash, "txHash");
          return txHash;
        case Network.NEAR:
          if (!selector) {
            return false;
          }
          const wallet = await selector.wallet();

          const trx = await wallet.signAndSendTransaction({
            receiverId: selectedToken.contractAddress,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "ft_transfer_call",
                  deposit: ONE_YOCTO,
                  gas: convertGas("80"),
                  args: {
                    amount: Big(amount).toFixed(),
                    receiver_id: depositAddress,
                  },
                },
              },
            ],
          });
          if (trx) {
            const successStatus = Object.prototype.hasOwnProperty.call(
              trx.status,
              "SuccessValue"
            );
            if (successStatus) {
              return true;
            } else return false;
          } else return false;
        case Network.TON:
          return console.log("ton");
      }
    },
  };
};

export default useNetwork;
