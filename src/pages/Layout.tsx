import HistoryIcon from "@/assets/history.svg?react";
import SupportIcon from "@/assets/support.svg?react";

import HowItWorksDialog from "@/components/how-it-works-dialog";
import { BridgeFormMachineContext } from "@/providers/machine-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  const actorRef = BridgeFormMachineContext.useActorRef();
  return (
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
            <div className="flex flex-row gap-2 justify-center align-center cursor-pointer">
              <span className="hidden text-center justify-center text-main_white text-base font-semibold font-['Inter'] sm:flex">
                Support
              </span>
              <SupportIcon className="w-5 h-5 self-center" />
            </div>
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
  );
}
