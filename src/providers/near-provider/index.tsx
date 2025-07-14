import "@near-wallet-selector/modal-ui/styles.css";

import type {
  AccountState,
  WalletModuleFactory,
  WalletSelector,
} from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { distinctUntilChanged, map } from "rxjs";
import { nearConfig } from "../../config";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const WalletSelectorContext = createContext<WalletSelectorContextValue | null>(
  null
);

export const WalletSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const initSelector = async () => {
    try {
      const selector = await setupWalletSelector({
        modules: nearConfig.modules.map(
          (moduleFactory) => moduleFactory() as WalletModuleFactory
        ),
        network: nearConfig.network,
        fallbackRpcUrls: nearConfig.fallbackRpcUrls,
      });
      const modal = setupModal(selector, { contractId: nearConfig.contractId });
      setSelector(selector);
      setModal(modal);
      return { selector, modal };
    } catch (e) {
      console.log("warn here", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const initializedSelector = await initSelector();
      if (!initializedSelector) return;

      const wallet = await initializedSelector.selector.wallet();
      const accounts = await wallet.getAccounts();

      initializedSelector.selector.on("signedIn", async (t) => {
        const wallet = await initializedSelector.selector.wallet();

        return { account: t.accounts[0].accountId, hot: wallet };
      });

      initializedSelector.selector.on("signedOut", async () => {
        throw Error("Not connected");
      });
      return { account: accounts[0].accountId, hot: wallet };
    };
    init();
  }, []);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = (selector.store.observable as any)
      .pipe(
        map((state: any) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts: Array<AccountState>) => {
        setAccounts(nextAccounts);
      });

    const onHideSubscription = modal!.on("onHide", ({ hideReason }) => {
      console.log(`The reason for hiding the modal ${hideReason}`);
    });

    return () => {
      subscription.unsubscribe();
      onHideSubscription.remove();
    };
  }, [selector, modal]);

  const walletSelectorContextValue = useMemo<WalletSelectorContextValue>(
    () => ({
      selector: selector!,
      modal: modal!,
      accounts,
      accountId: accounts.find((account) => account.active)?.accountId || null,
    }),
    [selector, modal, accounts]
  );

  return (
    <WalletSelectorContext.Provider value={walletSelectorContextValue}>
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
