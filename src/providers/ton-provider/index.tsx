import { TonConnect, TonConnectUIProvider } from "@tonconnect/ui-react";
import { PropsWithChildren } from "react";

import "@hot-wallet/sdk/adapter/ton";

export const TonProvider = ({ children }: PropsWithChildren) => {
  const connector = new TonConnect({
    manifestUrl:
      "https://bridge-lyart-three.vercel.app/tonconnect-manifest.json",
  });

  return (
    <TonConnectUIProvider connector={connector}>
      {children}
    </TonConnectUIProvider>
  );
};
