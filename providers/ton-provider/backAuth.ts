import { useIsConnectionRestored, useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useEffect, useRef } from "react";
import { mutate } from "swr";

import { useStore } from "@/hooks/store";
import { API_ROUTES } from "@/interfaces/api";
import { Network, NetworkChainMap } from "@/interfaces/network";
import { hapiApi } from "@/services/api/hapi";
import { isHereWallet } from "@/utils";

export const localStorageKey = "hapi-app-auth-token";
const payloadTTLMS = 1000 * 60 * 20;

export function useBackendAuth() {
  const isConnectionRestored = useIsConnectionRestored();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const interval = useRef<ReturnType<typeof setInterval> | undefined>();
  const network = useStore((store) => store.network);

  useEffect(() => {
    if (!isConnectionRestored || isHereWallet()) {
      return;
    }

    clearInterval(interval.current);

    if (!wallet) {
      localStorage.removeItem(localStorageKey);

      const refreshPayload = async () => {
        tonConnectUI.setConnectRequestParameters({ state: "loading" });
        const { data } = await hapiApi.getMessage();
        const value = {
          tonProof: data.payload,
        };

        if (!value) {
          tonConnectUI.setConnectRequestParameters(null);
        } else {
          tonConnectUI.setConnectRequestParameters({ state: "ready", value });
        }
      };

      refreshPayload();
      setInterval(refreshPayload, payloadTTLMS);
      return;
    }

    const token = localStorage.getItem(localStorageKey);
    if (token) {
      try {
        const parsedToken = JSON.parse(atob(token.split(".")[1]));

        if (parsedToken.iat < Date.now() / 1000) {
          tonConnectUI.disconnect();
          return;
        } else {
          return;
        }
      } catch (e) {
        return;
      }
    }

    if (wallet.connectItems?.tonProof && !("error" in wallet.connectItems.tonProof)) {
      if (network !== Network.TON && network !== Network.TON_TESTNET) return;
      try {
        hapiApi
          .checkProof({
            proof: {
              ...wallet.connectItems.tonProof.proof,
              state_init: wallet.account.walletStateInit,
            },
            address: wallet.account.address,
            network: NetworkChainMap[network],
          })
          .then((result) => {
            if (result) {
              localStorage.setItem(localStorageKey, result.data.jwt);
              mutate(`${API_ROUTES.USER}/${address}`);
            } else {
              tonConnectUI.disconnect();
            }
          });
      } catch (e) {
        console.warn(e, "error with backend Auth");
      }
    } else {
      tonConnectUI.disconnect();
    }
  }, [wallet, tonConnectUI, isConnectionRestored, network, address]);
}
