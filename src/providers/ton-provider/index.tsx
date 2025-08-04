import { TonConnect, TonConnectUIProvider } from "@tonconnect/ui-react";
import { PropsWithChildren } from "react";

import { basicConfig } from "@/config";

export const TonProvider = ({ children }: PropsWithChildren) => {
  const connector = new TonConnect({
    manifestUrl: basicConfig.tonConfig.manifestUrl,
  });

  return (
    <TonConnectUIProvider connector={connector}>
      {children}
    </TonConnectUIProvider>
  );
};
