import React, { useCallback, useContext, useEffect, useState } from "react";

import { map, distinctUntilChanged } from "rxjs/operators";
import {
  FinalExecutionOutcome,
  NetworkId,
  setupWalletSelector,
  Transaction,
  WalletSelectorState,
} from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { providers } from "near-api-js";

import { AccountView, CodeResult } from "near-api-js/lib/providers/provider";
import "@near-wallet-selector/modal-ui/styles.css";

import { getGas, getAmount } from "@/lib/providerHelpers";
import { basicConfig } from "@/config";
import { Big } from "big.js";

const BASE = 10;
const GAS_UNITS = 12;
const Tgas = Big(1).times(Big(BASE).pow(GAS_UNITS)).toFixed();

export const convertGas = (gas: string = "60"): string =>
  Big(gas).times(Tgas).toFixed();

export interface ITransaction {
  receiverId: string;
  functionCalls: {
    gas?: string;
    amount?: string;
    methodName: string;
    args?: object;
  }[];
}

export const ONE_YOCTO = "1";

export interface IRPCProviderService {
  viewFunction: (method: string, accountId: string, args?: any) => Promise<any>;
  viewAccount: (accountId: string) => Promise<any>;
}

enum RPCProviderMethods {
  CALL_FUNCTION = "call_function",
  VIEW_ACCOUNT = "view_account",
}

const FINALITY_FINAL = "final";

export default class RPCProviderService implements IRPCProviderService {
  private provider?: InstanceType<typeof providers.JsonRpcProvider>;

  constructor(provider?: InstanceType<typeof providers.JsonRpcProvider>) {
    this.provider = provider;
  }

  async viewFunction(method: string, accountId: string, args: any = {}) {
    try {
      if (!this.provider) return console.warn("No Provider selected");

      const response = await this.provider.query<CodeResult>({
        request_type: RPCProviderMethods.CALL_FUNCTION,
        account_id: accountId,
        method_name: method,
        args_base64: btoa(JSON.stringify(args || {})),
        finality: FINALITY_FINAL,
      });

      const result = JSON.parse(
        new TextDecoder().decode(new Uint8Array(response.result))
      );
      return result;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async viewAccount(accountId: string) {
    try {
      if (!this.provider) return console.warn("No Provider selected");
      const response = await this.provider.query<AccountView>({
        request_type: RPCProviderMethods.VIEW_ACCOUNT,
        finality: FINALITY_FINAL,
        account_id: accountId,
      });
      console.log(response);
      return response.amount;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}

interface WalletSelectorContextValue {
  openModal: () => void;
  selector: WalletSelector | null;
  requestSignTransactions: (
    t: ITransaction[]
  ) => Promise<void | FinalExecutionOutcome[]>;
  accountId: string;
  RPCProvider: IRPCProviderService;
  signOut: () => Promise<void>;
  lastTransaction: number;
}

const WalletSelectorContext = React.createContext<WalletSelectorContextValue>(
  {} as WalletSelectorContextValue
);

export const WalletSelectorContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string>("");
  const [RPCProvider, setRPCProvider] = useState<IRPCProviderService>(
    new RPCProviderService()
  );
  const [lastTransaction, setLastTransaction] = useState<number>(Date.now());

  const syncAccountState = (
    currentAccountId: string | null,
    newAccounts: Array<AccountState>
  ) => {
    if (!newAccounts.length) {
      localStorage.removeItem("accountId");
      setAccountId("");

      return;
    }

    const validAccountId =
      currentAccountId &&
      newAccounts.some((x) => x.accountId === currentAccountId);
    const newAccountId = validAccountId
      ? currentAccountId
      : newAccounts[0].accountId;

    localStorage.setItem("accountId", newAccountId);
    setAccountId(newAccountId);
  };

  const init = useCallback(async () => {
    const selectorInstance = await setupWalletSelector({
      network: basicConfig.nearConfig.network as NetworkId,
      debug: true,
      modules: basicConfig.nearConfig.modules,
    });
    const modalInstance = setupModal(selectorInstance, {
      contractId: basicConfig.nearConfig.contractId,
    });
    const state = selectorInstance.store.getState();
    syncAccountState(localStorage.getItem("accountId"), state.accounts);

    window.selector = selectorInstance;
    window.modal = modalInstance;

    const { network } = selectorInstance.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const providerService = new RPCProviderService(provider);
    setRPCProvider(providerService);
    setSelector(selectorInstance);
    setModal(modalInstance);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = (selector.store.observable as any)
      .pipe(
        map((state: WalletSelectorState) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts: AccountState[]) => {
        syncAccountState(accountId, nextAccounts);
      });

    // eslint-disable-next-line consistent-return
    return () => subscription.unsubscribe();
  }, [selector, accountId]);

  const requestSignTransactions = useCallback(
    async (transactions: ITransaction[]) => {
      if (!selector) return console.warn("No wallet selected");

      const nearTransactions: Transaction[] = transactions.map(
        (transaction: ITransaction) => ({
          signerId: accountId,
          receiverId: transaction.receiverId,
          actions: transaction.functionCalls.map((fc) => ({
            type: "FunctionCall",
            params: {
              methodName: fc.methodName,
              args: fc.args || {},
              gas: getGas(fc.gas).toString(),
              deposit: getAmount(fc.amount).toString(),
            },
          })),
        })
      );

      const walletInstance = await selector.wallet();
      const result = await walletInstance.signAndSendTransactions({
        transactions: nearTransactions,
      });
      setLastTransaction(Date.now());
      return result;
    },
    [selector, accountId]
  );

  const openModal = useCallback(() => {
    if (!modal) return;

    modal.show();
  }, [modal]);

  const signOut = useCallback(async () => {
    try {
      if (!selector) return;
      const wallet = await selector.wallet();

      await wallet.signOut();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }, [selector]);

  if (!selector || !modal) {
    return null;
  }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        accountId,
        openModal,
        requestSignTransactions,
        RPCProvider,
        signOut,
        lastTransaction,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  return useContext(WalletSelectorContext);
}
