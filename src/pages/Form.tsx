import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetSelection } from "@/components/asset-selection";
import { NetworkSelection } from "@/components/network-selection";
import { DepositMethod } from "@/components/deposit-method";
import { BridgeModal } from "@/components/bridge-modal";
import { ArrowRight, CheckCircle, ChevronDown, Zap } from "lucide-react";
import { Asset } from "@/lib/1clickHelper";
import { Network } from "@/config";
import { enforcer } from "@/lib/utils";

export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export interface FormData {
  asset: Asset;
  network: Network | null;
  depositMethod: EDepositMethod;
  amount: string;
  sourceWalletConnected: boolean;
  arbitrumWalletConnected: boolean;
  arbitrumAddress: string;
}

export default function Form() {
  const [amount, setAmount] = useState<string>("");

  return (
    <div className="p-4 w-full min-h-96">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="text-2xl text-white font-inter font-normal">
          Bridge to USDC on Arbitrum
        </div>
        <span className=" text-white font-light text-xs">
          Select asset and network you want to swap to USDC for Hyperliquid
          deposit.
        </span>
      </div>
      <div className="flex flex-col justify-center items-center mb-10">
        <div className="flex flex-col gap-2">
          <label htmlFor="from" className="text-white font-thin text-sm">
            From
          </label>
          <div className="bg-[#1B2429] rounded-2xl p-4 flex items-center gap-2  w-[480px]">
            <img src="/src/assets/empty-state.svg" alt="empty-state" />
            <span className="grow-2 size-base text-white text-sm font-light">
              Select chain and token
            </span>
            <ChevronDown color="white" className="w-4 h-4 " />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col gap-2">
          <label htmlFor="from" className="text-white font-thin text-sm">
            Amount
          </label>
          <div className="bg-[#1B2429] rounded-2xl p-4 flex flex-col items-start gap-2  w-[480px]">
            <input
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              className="text-[#9DB2BD] border-none outline-none text-2xl w-full font-light"
              value={amount}
              onChange={(e) => enforcer(e, setAmount)}
              placeholder="0"
              inputMode="decimal"
              autoComplete="off"
              minLength={1}
              maxLength={79}
              spellCheck="false"
              autoCorrect="off"
            />
            <span className="text-[#9DB2BD] text-xs font-light">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
