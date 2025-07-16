import { useState } from "react";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import { fetchTokens } from "@/lib/1clickHelper";
import { Network } from "@/config";
import { enforcer } from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";
import { useQuery } from "@tanstack/react-query";

export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export interface FormData {
  asset: TokenResponse;
  network: Network | null;
  depositMethod: EDepositMethod;
  amount: string;
  sourceWalletConnected: boolean;
  arbitrumWalletConnected: boolean;
  arbitrumAddress: string;
}

export default function Form() {
  const [amount, setAmount] = useState<string>("");

  const { data } = useQuery({
    queryKey: ["one-click-tokens"],
    queryFn: async () => {
      const response = await fetchTokens();
      return response;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

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
        <SelectTokenDialog
          allTokens={data ?? []}
          selectToken={() => {}}
          selectedToken={null}
        />
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
