import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Providers } from "@/providers";
import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import Layout from "./pages/Layout";
import Form from "./pages/Form";
import { History } from "./pages/History";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TokenContextProvider } from "./providers/token-context";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import ReactGA from "react-ga4";

ReactGA.initialize("G-NBNSX5TW8C");

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <TokenContextProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Form />} />
              <Route path="/:id" element={<Form />} />
              <Route path="/history" element={<History />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TokenContextProvider>
    </Providers>
  </StrictMode>
);
