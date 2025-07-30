import { basicConfig, Network } from "@/config";

import { useWalletSelector } from "@/providers/near-provider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";

import { useAppKit } from "@reown/appkit/react";
import { Account, Transaction } from "@near-wallet-selector/core";

import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import { getBalance } from "wagmi/actions";
import { wagmiAdapter } from "@/providers/evm-provider";
import { tonClient } from "@/providers/ton-provider/ton-utils";
import { Address, beginCell, toNano } from "@ton/core";
import { getSplTokenBalance } from "@/providers/solana-provider/solana-utils";
import { useAppKitAccount } from "@reown/appkit/react";

import {
  prepareTransactionRequest,
  sendTransaction,
  signTypedData,
  switchChain,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { encodeFunctionData, erc20Abi, parseEther, parseUnits } from "viem";

import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction as SolanaTransaction,
} from "@solana/web3.js";
import { parseTokenAmount } from "@/lib/utils";
import { getOrCreateAssociatedTokenAccount } from "@/providers/solana-provider";
import { PermitDataResponse } from "@/providers/proxy-provider";
import {
  checkSwapStorageBalance,
  ITransaction,
  ONE_YOCTO_NEAR,
} from "@/lib/nearHelper";
import { getAmount, getGas } from "@/lib/providerHelpers";
import { FormInterface } from "@/lib/validation";
import { UseFormWatch } from "react-hook-form";

const useNetwork = (
  network: Network | null,
  setValue: (key: keyof FormInterface, value: any) => void,
  watch: UseFormWatch<FormInterface>
) => {
  const connectedEVMWallet = watch("connectedEVMWallet");
  const [nearAddress, setNearAddress] = useState<Account | null>(null);
  const { openModal, selector, RPCProvider } = useWalletSelector();
  const { isConnected, address } = useAccount();
  const { publicKey, connect } = useWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { open } = useAppKit();
  const [isNearConnected, setIsNearConnected] = useState(false);

  const evmAccount = useAppKitAccount({ namespace: "eip155" });
  console.log("evmAccount", evmAccount);
  const tonWallet = useTonWallet();

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

  useEffect(() => {
    if (evmAccount.address && !connectedEVMWallet) {
      console.log("evmAccount.address", evmAccount.address);
      setValue("connectedEVMWallet", true);
    }
  }, [evmAccount.address]);

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
    connectWallet: (localNetwork?: Network) => {
      const currentNetwork = localNetwork ?? network;
      switch (currentNetwork) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return open({
            view: "Connect",
            namespace: "eip155",
          });
        case Network.SOLANA:
          return connect();
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
    getPublicKey: (localNetwork?: Network) => {
      const currentNetwork = localNetwork ?? network;
      switch (currentNetwork) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return address;
        case Network.SOLANA:
          return publicKey?.toBase58();
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
          if (!publicKey) return 0;
          return getSplTokenBalance(
            publicKey,
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
          const tx = new SolanaTransaction();
          if (!selectedToken.contractAddress || !publicKey) {
            return false;
          }
          let sourceAccount = await getAssociatedTokenAddress(
            new PublicKey(selectedToken.contractAddress),
            publicKey,
            false,
            publicKey
          );
          let {
            status: isAccountCreated,
            account: solanaDestinationAccount,
            instruction,
          } = await getOrCreateAssociatedTokenAccount(
            solanaConnection,
            new PublicKey(selectedToken.contractAddress),
            publicKey,
            false,
            publicKey.toBase58()
          );
          if (!isAccountCreated && instruction) {
            tx.add(instruction);
            solanaDestinationAccount = await getAssociatedTokenAddress(
              new PublicKey(selectedToken.contractAddress),
              publicKey,
              false,
              publicKey
            );
          }
          if (!solanaDestinationAccount) {
            console.log("solanaDestinationAccount not found");
            return false;
          }
          tx.add(
            createTransferInstruction(
              new PublicKey(sourceAccount),
              new PublicKey(solanaDestinationAccount),
              publicKey,
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
          console.log(depositAddress, "depositAddress");
          if (
            !selector ||
            !nearAddress?.accountId ||
            !selectedToken.contractAddress
          ) {
            return false;
          }
          const wallet = await selector.wallet();
          const transactions: ITransaction[] = [];
          const storageBalance = await checkSwapStorageBalance({
            contractId: selectedToken.contractAddress as string,
            provider: RPCProvider,
            depositAddress: depositAddress,
          });
          transactions.push(...storageBalance);
          transactions.push({
            receiverId: selectedToken.contractAddress,
            functionCalls: [
              {
                methodName: "ft_transfer",
                args: {
                  amount: parseTokenAmount(amount, selectedToken.decimals),
                  receiver_id: depositAddress,
                  msg: "",
                },
                amount: ONE_YOCTO_NEAR,
              },
            ],
          });
          const nearTransactions: Transaction[] = transactions.map(
            (transaction: ITransaction) => ({
              signerId: nearAddress?.accountId,
              receiverId: transaction.receiverId,
              actions: transaction.functionCalls.map((fc) => ({
                type: "FunctionCall",
                params: {
                  methodName: fc.methodName,
                  args: fc.args || {},
                  gas: getGas(fc.gas).toFixed(),
                  deposit: getAmount(fc.amount).toFixed(),
                },
              })),
            })
          );
          const trx = await wallet.signAndSendTransactions({
            transactions: nearTransactions,
          });

          if (trx && Array.isArray(trx) && trx.length > 0) {
            const lastOutcome = trx[trx.length - 1];
            const successStatus = Object.prototype.hasOwnProperty.call(
              lastOutcome.status,
              "SuccessValue"
            );
            if (successStatus) {
              return true;
            } else return false;
          } else return false;
        case Network.TON:
          if (!tonWallet?.account?.address || !selectedToken.contractAddress) {
            return false;
          }
          const jettonWalletAddress = Address.parse(
            selectedToken.contractAddress
          );
          const toAddress = Address.parse(depositAddress);
          const jettonAmount = toNano(amount);

          const payload = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(jettonAmount)
            .storeAddress(toAddress)
            .storeAddress(Address.parse(tonWallet?.account?.address))
            .storeBit(false)
            .storeCoins(toNano("0.1"))
            .storeBit(false)
            .endCell()
            .toBoc()
            .toString("base64");

          const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // valid for 10 minutes
            messages: [
              {
                address: jettonWalletAddress.toString(),
                amount: toNano("0.05").toString(),
                payload,
              },
            ],
          };

          try {
            await tonConnectUI.sendTransaction(transaction);
            alert("Transaction sent!");
          } catch (err) {
            console.error(err);
            alert("Transaction failed.");
          }
          return true;
      }
    },
    signData: async (data: PermitDataResponse) => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
        case Network.NEAR:
        case Network.TON:
          const { message, types, domain } = data.data;
          await switchChain(wagmiAdapter.wagmiConfig, {
            chainId: Number(domain.chainId),
          });
          console.log(domain.chainId, "domain.chainId");
          return signTypedData(wagmiAdapter.wagmiConfig, {
            types,
            primaryType: "Permit",
            domain: {
              name: domain.name,
              version: domain.version,
              chainId: BigInt(domain.chainId),
              verifyingContract: domain.verifyingContract as `0x${string}`,
            },
            message: {
              owner: message.owner as `0x${string}`,
              spender: message.spender as `0x${string}`,
              value: BigInt(message.value),
              nonce: BigInt(message.nonce),
              deadline: BigInt(message.deadline),
            },
          });
      }
    },
  };
};

export default useNetwork;
