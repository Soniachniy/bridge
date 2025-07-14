import { TonConnect, TonConnectUIProvider } from "@tonconnect/ui-react";
import { PropsWithChildren } from "react";
import { tonConfig } from "../../config";

import "@hot-wallet/sdk/adapter/ton";

export const TonProvider = ({ children }: PropsWithChildren) => {
  const connector = new TonConnect({
    walletsListSource: tonConfig.walletsListSource,
    manifestUrl: tonConfig.manifestUrl,
  });

  return (
    <TonConnectUIProvider connector={connector}>
      {children}
    </TonConnectUIProvider>
  );
};
