import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import HyperliquidBridge from "./page.tsx";
import { Providers } from "@/providers";
import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <HyperliquidBridge />
    </Providers>
  </StrictMode>
);
