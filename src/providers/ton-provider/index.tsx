import { TonConnect, TonConnectUIProvider } from "@tonconnect/ui-react";
import { PropsWithChildren } from "react";

import "@hot-wallet/sdk/adapter/ton";

export const TonProvider = ({ children }: PropsWithChildren) => {
  const connector = new TonConnect({
    manifestUrl: "./public/tonconnect-manifest.json",
  });

  return (
    <TonConnectUIProvider connector={connector}>
      {children}
    </TonConnectUIProvider>
  );
};
