import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Providers } from "@/providers";
import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import Layout from "./pages/Layout";
import Form from "./pages/Form";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <Layout>
        <Form />
      </Layout>
    </Providers>
  </StrictMode>
);
