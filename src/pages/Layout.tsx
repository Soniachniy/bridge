import HistoryIcon from "@/assets/history.svg?react";

import HowItWorksDialog from "@/components/how-it-works-dialog";
import { BridgeFormMachineContext } from "@/providers/machine-provider";
import { SupportModal } from "@/components/support-modal";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formValidationSchema } from "@/lib/validation";
import { EStrategy } from "@/pages/Form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { SLIPPAGE } from "@/lib/constants";

export default function Layout({ children }: { children: React.ReactNode }) {
  const actorRef = BridgeFormMachineContext.useActorRef();
  const methods = useForm({
    resolver: zodResolver(formValidationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      amount: "",
      strategy: EStrategy.Wallet,
      amountOut: "0",
      selectedToken: {
        assetId:
          "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near",
        blockchain: TokenResponse.blockchain.ETH,
        decimals: 6,
        price: 0,
        priceUpdatedAt: "0",
        symbol: "USDT",
        balance: 0n,
        balanceNear: 0n,
        balanceUpdatedAt: 0,
      },
      hyperliquidAddress: "",
      refundAddress: "",
      depositAddress: "",
      slippageValue: SLIPPAGE,
      platformFee: "0",
      gasFee: "0",
      txHash: "",
    },
  });
  return (
    <FormProvider {...methods}>
      <div className="flex flex-col min-h-screen bg-main justify-between">
        <header>
          <div className="flex justify-between items-center mx-5 md:mx-20 my-6">
            <div
              className="flex items-center gap-2"
              onClick={() => {
                actorRef.send({ type: "back_to_asset_selection" });
              }}
            >
              <img
                src="/logo-extended.svg"
                alt="logo"
                className="w-full h-full cursor-pointer"
              />
            </div>

            <div className="flex flex-row items-center gap-4">
              <SupportModal />
              <div className="flex flex-row gap-2 justify-center align-center cursor-pointer">
                <span className="hidden text-center justify-center text-main_white text-base font-semibold font-['Inter'] sm:flex">
                  History
                </span>
                <HistoryIcon className="w-5 h-5 self-center" />
              </div>
              <HowItWorksDialog />
            </div>
          </div>
        </header>
        {children}
        <footer>
          <div className="flex justify-between items-center mx-4 md:mx-26 my-10">
            <span className="text-white text-sm underline font-light">
              Privacy Policy
            </span>
            <span className="text-white text-sm underline font-light">
              Terms of Service
            </span>
          </div>
        </footer>
      </div>
    </FormProvider>
  );
}
