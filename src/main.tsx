import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Providers } from "@/providers";
import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import Layout from "./pages/Layout";
import Form from "./pages/Form";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProcessingScreen from "./pages/ProcessingScreen";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Form />} />
            <Route path="/:id" element={<ProcessingScreen />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Providers>
  </StrictMode>
);
