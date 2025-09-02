import { getNetworkChainId, Network } from "@/config";

import { convertGas, useWalletSelector } from "@/providers/near-provider";
import { useAccount, useAccountEffect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

import { useAppKit } from "@reown/appkit/react";
import { Transaction } from "@near-wallet-selector/core";

import {
  useTonWallet,
  useTonConnectUI,
  toUserFriendlyAddress,
} from "@tonconnect/ui-react";
import { getBalance } from "wagmi/actions";
import { wagmiAdapter } from "@/providers/evm-provider";
import {
  createDepositTonTransaction,
  tonClient,
} from "@/providers/ton-provider/ton-utils";
import { Address } from "@ton/core";
import {
  createSPLTransferSolanaTransaction,
  checkSolanaATARequired,
  getSplTokenBalance,
  createTransferSolanaTransaction,
  getSolanaNativeBalance,
} from "@/providers/solana-provider/solana-utils";

import {
  prepareTransactionRequest,
  sendTransaction,
  signTypedData,
  switchChain,
  waitForTransactionReceipt,
  disconnect,
  getAccount,
} from "@wagmi/core";
import { encodeFunctionData, erc20Abi, parseEther, parseUnits } from "viem";

import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import { formatTokenAmount, parseTokenAmount } from "@/lib/utils";

import { PermitDataResponse } from "@/providers/proxy-provider";
import {
  checkSwapStorageBalance,
  ITransaction,
} from "@/providers/near-provider/nearHelper";
import { getAmount, getGas } from "@/providers/near-provider/nearHelper";
import { FormInterface } from "@/lib/validation";

import { isNativeToken } from "@/lib/1clickHelper";
import { translateTokenToNetwork } from "@/config";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ONE_YOCTO_NEAR, RESERVED_NEAR_BALANCE } from "@/lib/constants";

import { useConnection } from "@solana/wallet-adapter-react";

const useNetwork = (
  network: Network | null,
  setValue?: (key: keyof FormInterface, value: any) => void
) => {
  /* SOLANA */
  const {
    publicKey,
    disconnect: disconnectSolana,
    wallet: solanaWallet,
  } = useWallet();
  const { connection: solanaConnection } = useConnection();
  const { setVisible } = useWalletModal();
  const { sendTransaction: sendTransactionSolana } = useWallet();

  /* EVM */
  const { open } = useAppKit();
  const { isConnected, address } = useAccount({
    config: wagmiAdapter.wagmiConfig,
  });

  useEffect(() => {
    if (isConnected && address && setValue) {
      setValue("hyperliquidAddress", address);
    }
  }, [isConnected, address, setValue]);

  useAccountEffect({
    config: wagmiAdapter.wagmiConfig,
    onConnect: (account) => {
      if (account && setValue) {
        setValue("hyperliquidAddress", account.address);
      }
    },
    onDisconnect: () => {
      if (setValue) {
        setValue("hyperliquidAddress", null);
      }
    },
  });

  /* TON */
  const tonWallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  /* NEAR */
  const { openModal, signOut, selector, RPCProvider } = useWalletSelector();
  const { accountId } = useWalletSelector();

  return {
    isConnected: (localNetwork?: Network) => {
      const currentNetwork = localNetwork ?? network;

      switch (currentNetwork) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return isConnected;
        case Network.NEAR:
          return accountId?.length > 0;
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
          try {
            return setVisible(true);
          } catch (e) {
            console.log("SOLANA", e);
            return null;
          }
        case Network.NEAR:
          return openModal();
        case Network.TON:
          return tonConnectUI.openModal();
        default:
          return null;
      }
    },
    disconnectWallet: (localNetwork?: Network) => {
      const currentNetwork = localNetwork ?? network;
      switch (currentNetwork) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          return disconnect(wagmiAdapter.wagmiConfig);
        case Network.SOLANA:
          return disconnectSolana();
        case Network.NEAR:
          return signOut();
        case Network.TON:
          return tonConnectUI.disconnect();
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
          return accountId;
        case Network.TON:
          return tonWallet?.account?.address
            ? toUserFriendlyAddress(tonWallet?.account?.address)
            : null;
        default:
          return null;
      }
    },

    getBalance: async (
      assetId: string,
      contractAddress?: string,
      blockchain?: TokenResponse.blockchain
    ): Promise<{
      balance: bigint;
      nearBalance: bigint;
    }> => {
      const currentNetwork = blockchain
        ? translateTokenToNetwork(blockchain)
        : network;
      switch (currentNetwork) {
        case Network.BASE:
        case Network.AURORA:
        case Network.BNB:
        case Network.ARBITRUM:
        case Network.POLYGON:
        case Network.ETHEREUM:
          let balanceEVM = 0n;
          const chainId = getNetworkChainId(
            blockchain ?? (network as unknown as TokenResponse.blockchain)
          );
          if (!chainId) {
            return { balance: 0n, nearBalance: 0n };
          }
          if (isNativeToken(currentNetwork, assetId)) {
            const { value: nativeBalanceEVM } = await getBalance(
              wagmiAdapter.wagmiConfig,

              {
                address: address as `0x${string}`,
                chainId: chainId,
              }
            );
            balanceEVM = nativeBalanceEVM;
          } else if (contractAddress) {
            const { value: tokenBalanceEVM } = await getBalance(
              wagmiAdapter.wagmiConfig,
              {
                address: address as `0x${string}`,
                token: contractAddress as `0x${string}`,
                chainId: chainId,
              }
            );
            balanceEVM = tokenBalanceEVM;
          }

          return { balance: balanceEVM, nearBalance: 0n };
        case Network.SOLANA:
          if (!publicKey) return { balance: 0n, nearBalance: 0n };
          const solanaNative = isNativeToken(Network.SOLANA, assetId);
          if (solanaNative) {
            const balance = await getSolanaNativeBalance({
              userAddress: publicKey.toBase58(),
            });
            return { balance: balance ?? 0n, nearBalance: 0n };
          }
          if (contractAddress) {
            const balance = await getSplTokenBalance(
              publicKey,
              contractAddress as `0x${string}`
            );
            return {
              balance: BigInt(balance?.toString() ?? 0),
              nearBalance: 0n,
            };
          }
          return { balance: 0n, nearBalance: 0n };
        case Network.NEAR:
          if (!contractAddress || !accountId) {
            return { balance: 0n, nearBalance: 0n };
          }
          let nearBalance = 0n;
          const tokenBalance = await RPCProvider.viewFunction(
            "ft_balance_of",
            contractAddress,
            {
              account_id: accountId,
            }
          );
          if (contractAddress === "wrap.near") {
            const nativeNearBalance = await RPCProvider.viewAccount(accountId);

            const balance = BigInt(nativeNearBalance);
            nearBalance =
              balance < RESERVED_NEAR_BALANCE
                ? 0n
                : balance - RESERVED_NEAR_BALANCE;
          }

          return {
            balance: BigInt(tokenBalance ?? 0) + BigInt(nearBalance ?? 0),
            nearBalance: BigInt(nearBalance ?? 0),
          };
        case Network.TON:
          if (!tonWallet?.account?.address) {
            return { balance: 0n, nearBalance: 0n };
          }
          if (isNativeToken(currentNetwork, assetId)) {
            const { balance } = await tonClient.accounts.getAccount(
              Address.parse(tonWallet?.account?.address)
            );
            return { balance: balance, nearBalance: 0n };
          }
          if (!contractAddress) {
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
          const account = getAccount(wagmiAdapter.wagmiConfig);
          if (
            getNetworkChainId(selectedToken.blockchain) &&
            account.chainId !== getNetworkChainId(selectedToken.blockchain)
          ) {
            await switchChain(wagmiAdapter.wagmiConfig, {
              chainId: Number(getNetworkChainId(selectedToken.blockchain)),
            });
          }
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

          const hash = await sendTransaction(wagmiAdapter.wagmiConfig, request);
          const status = await waitForTransactionReceipt(
            wagmiAdapter.wagmiConfig,
            { hash }
          );
          return status.status === "success";
        case Network.SOLANA:
          const solanaNative = isNativeToken(
            translateTokenToNetwork(selectedToken.blockchain),
            selectedToken.assetId
          );
          const solanaATACreationRequired = await checkSolanaATARequired(
            depositAddress,
            solanaNative,
            selectedToken.contractAddress
          );
          console.log(solanaATACreationRequired, "solanaATACreationRequired");
          if (!publicKey) {
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
                selectedToken.contractAddress as `0x${string}`,
                !solanaATACreationRequired
              );

          const latestBlockHash = await solanaConnection.getLatestBlockhash(
            "confirmed"
          );
          transactionSolana.recentBlockhash = latestBlockHash.blockhash;

          console.log(solanaWallet?.adapter.name, "solanaWallet?.adapter.name");
          // if (solanaWallet?.adapter.name === "HOT Wallet") {
          //   // TEMP FIX UNTIL HOT WALLET SUPPORT
          //   try {
          //     const txHash = await sendTransactionSolana(
          //       transactionSolana,
          //       solanaConnection
          //     );
          //     return txHash;
          //   } catch (e) {
          //     console.log(e, "e");

          //     return true;
          //   }
          // } else {
          const txHash = await sendTransactionSolana(
            transactionSolana,
            solanaConnection
          );
          console.log(txHash, "txHash");
          return txHash;
        // }
        case Network.NEAR:
          if (!selector || !accountId || !selectedToken.contractAddress) {
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
          transactions.push(...storageBalanceTx);
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
                    args: {},
                    gas: convertGas("100"),
                    amount: formatTokenAmount(nearToWrap.toString(), 24, 24),
                  },
                ],
              });
            }
          }

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
              signerId: accountId,
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
          if (!tonWallet?.account?.address) {
            return false;
          }
          const transaction = await createDepositTonTransaction(
            tonWallet?.account?.address,
            depositAddress,
            BigInt(parseTokenAmount(amount, decimals)),
            selectedToken
          );
          if (!transaction) return false;

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
