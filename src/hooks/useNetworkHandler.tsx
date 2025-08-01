import { basicConfig, Network } from "@/config";

import { convertGas, useWalletSelector } from "@/providers/near-provider";
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
import {
  createSPLTransferSolanaTransaction,
  checkSolanaATARequired,
  getSplTokenBalance,
  createTransferSolanaTransaction,
} from "@/providers/solana-provider/solana-utils";
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
} from "@/providers/near-provider/nearHelper";
import { getAmount, getGas } from "@/providers/near-provider/nearHelper";
import { FormInterface } from "@/lib/validation";
import { UseFormWatch } from "react-hook-form";
import { isNativeToken, translateNetwork } from "@/lib/1clickHelper";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const useNetwork = (
  network: Network | null,
  setValue: (key: keyof FormInterface, value: any) => void,
  watch: UseFormWatch<FormInterface>
) => {
  /* SOLANA */
  const { publicKey, connect } = useWallet();
  const solanaConnection = new Connection(basicConfig.solanaConfig.endpoint);
  const { setVisible } = useWalletModal();
  /* EVM */
  const { open } = useAppKit();
  const evmAccount = useAppKitAccount({ namespace: "eip155" });
  const connectedEVMWallet = watch("connectedEVMWallet");

  useEffect(() => {
    if (evmAccount.address && !connectedEVMWallet) {
      setValue("connectedEVMWallet", true);
    }
  }, [evmAccount.address]);

  /* TON */
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  /* NEAR */
  const { openModal, selector, RPCProvider } = useWalletSelector();
  const [nearAddress, setNearAddress] = useState<Account | null>(null);
  const [isNearConnected, setIsNearConnected] = useState(false);
  const { isConnected, address } = useAccount();
  const updateIsNearConnected = useCallback(async () => {
    if (selector) {
      try {
        const selectedWalletId = selector?.store.getState().selectedWalletId;
        if (!selectedWalletId) {
          return;
        }
        const wallet = await selector.wallet(selectedWalletId);
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
          return setVisible(true);
        case Network.NEAR:
          return openModal();
        case Network.TON:
          return tonConnectUI.openModal();
        default:
          return null;
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
    getBalance: async (
      assetId: string,
      contractAddress?: string
    ): Promise<{
      balance: bigint;
      nearBalance: bigint;
    }> => {
      switch (network) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          let balanceEVM = 0n;
          if (isNativeToken(network, assetId)) {
            const { value: nativeBalanceEVM } = await getBalance(
              wagmiAdapter.wagmiConfig,
              {
                address: address as `0x${string}`,
              }
            );
            balanceEVM = nativeBalanceEVM;
          } else {
            const { value: tokenBalanceEVM } = await getBalance(
              wagmiAdapter.wagmiConfig,
              {
                address: address as `0x${string}`,
                token: contractAddress as `0x${string}`,
              }
            );
            balanceEVM = tokenBalanceEVM;
          }

          return { balance: balanceEVM, nearBalance: 0n };
        case Network.SOLANA:
          if (!publicKey) return { balance: 0n, nearBalance: 0n };
          const balance = await getSplTokenBalance(
            publicKey,
            contractAddress as `0x${string}`
          );
          return { balance: BigInt(balance ?? 0), nearBalance: 0n };
        case Network.NEAR:
          if (!contractAddress || !nearAddress?.accountId) {
            return { balance: 0n, nearBalance: 0n };
          }
          let nearBalance = 0;
          const tokenBalance = await RPCProvider.viewFunction(
            "ft_balance_of",
            contractAddress,
            {
              account_id: nearAddress?.accountId,
            }
          );
          console.log(tokenBalance, "tokenBalance");
          if (contractAddress === "wrap.near") {
            nearBalance = await RPCProvider.viewAccount(nearAddress?.accountId);
          }

          return {
            balance: BigInt(tokenBalance ?? 0) + BigInt(nearBalance ?? 0),
            nearBalance: BigInt(nearBalance ?? 0),
          };
        case Network.TON:
          if (!tonWallet?.account?.address || !contractAddress) {
            return { balance: 0n, nearBalance: 0n };
          }
          const tonTokenBalance =
            await tonClient.accounts.getAccountJettonBalance(
              Address.parse(tonWallet?.account?.address),
              Address.parse(contractAddress)
            );
          return {
            balance: BigInt(tonTokenBalance.balance.toString()),
            nearBalance: 0n,
          };

        default:
          return { balance: 0n, nearBalance: 0n };
      }
    },
    makeDeposit: async (
      selectedToken: TokenResponse,
      depositAddress: string,
      amount: string,
      decimals: number,
      balance: { balance: bigint; nearBalance?: bigint }
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
            isNativeToken(network, selectedToken.assetId)
              ? {
                  to: depositAddress as `0x${string}`,
                  value: parseEther(amount),
                  data: "0x",
                }
              : {
                  to: selectedToken.contractAddress as `0x${string}`,
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
          console.log(request, "request");
          const hash = await sendTransaction(wagmiAdapter.wagmiConfig, request);
          const status = await waitForTransactionReceipt(
            wagmiAdapter.wagmiConfig,
            { hash }
          );
          return status.status === "success";
        case Network.SOLANA:
          const solanaNative = isNativeToken(
            translateNetwork(selectedToken.blockchain),
            selectedToken.assetId
          );
          const solanaATACreationRequired = await checkSolanaATARequired(
            depositAddress,
            solanaNative,
            selectedToken.contractAddress
          );

          if (!selectedToken.contractAddress || !publicKey) {
            return false;
          }
          const transactionSolana = solanaNative
            ? createTransferSolanaTransaction(
                publicKey.toBase58(),
                depositAddress,
                BigInt(parseTokenAmount(amount, decimals))
              )
            : createSPLTransferSolanaTransaction(
                publicKey.toBase58(),
                depositAddress,
                BigInt(parseTokenAmount(amount, decimals)),
                selectedToken.contractAddress,
                !solanaATACreationRequired
              );

          const latestBlockHash = await solanaConnection.getLatestBlockhash(
            "confirmed"
          );
          transactionSolana.recentBlockhash = await latestBlockHash.blockhash;
          const txHash = await sendAndConfirmTransaction(
            solanaConnection,
            transactionSolana,
            []
          );
          console.log(txHash, "txHash");
          return txHash;
        case Network.NEAR:
          console.log(
            selector,
            nearAddress?.accountId,
            selectedToken,
            "selectedToken"
          );
          if (
            !selector ||
            !nearAddress?.accountId ||
            !selectedToken.contractAddress
          ) {
            return false;
          }
          const wallet = await selector.wallet();
          const transactions: ITransaction[] = [];
          const { tx: storageBalanceTx, amount: storageAmount } =
            await checkSwapStorageBalance({
              contractId: selectedToken.contractAddress as string,
              provider: RPCProvider,
              depositAddress: depositAddress,
            });
          if (selectedToken.contractAddress === "wrap.near") {
            const wrappedNearBalance =
              balance.balance - (balance?.nearBalance ?? 0n);
            const nearToWrap =
              BigInt(parseTokenAmount(amount, selectedToken.decimals)) +
              storageAmount -
              wrappedNearBalance;

            if (nearToWrap >= (balance?.nearBalance ?? 0n)) return false;

            if (nearToWrap > 0n) {
              transactions.push({
                receiverId: selectedToken.contractAddress,
                functionCalls: [
                  {
                    methodName: "near_deposit",
                    args: { amount: nearToWrap.toString() },
                    gas: convertGas("100"),
                    amount: ONE_YOCTO_NEAR,
                  },
                ],
              });
            }
          }

          transactions.push(...storageBalanceTx);
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
