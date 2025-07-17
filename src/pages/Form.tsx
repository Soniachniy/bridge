import { useState } from "react";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import { fetchTokens, translateNetwork } from "@/lib/1clickHelper";
import { Network } from "@/config";
import { enforcer, truncateAddress } from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useDebounce } from "@/hooks/useDebounce";
import useNetwork from "@/hooks/useNetworkHandler";

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
}

export interface FormInterface {
  selectedToken: TokenResponse | null;
  amount: string;
}

export default function Form() {
  const { control, setValue } = useForm<FormInterface>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      amount: "",
      selectedToken: null,
    },
  });

  const amountIn = useWatch({ control: control, name: "amount" });

  const [debouncedAmountIn, setDebouncedValue] = useState<string | null>(null);
  useDebounce(() => setDebouncedValue(amountIn), amountIn ? 1000 : 0, [
    amountIn,
  ]);

  const selectedToken = useWatch({ control, name: "selectedToken" });
  const { connectWallet, getPublicKey, isConnected } = useNetwork(
    translateNetwork(selectedToken?.blockchain)
  );

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
        <div className="flex flex-col gap-2 justify-center items-center">
          <div className="flex flex-row gap-2 justify-between w-[480px]">
            <label
              htmlFor="from"
              className="text-white font-thin text-sm text-left  w-[480px]"
            >
              From
            </label>
            {isConnected() && (
              <label
                htmlFor="from"
                className="text-white font-thin text-sm text-left  w-[480px] text-right"
              >
                {truncateAddress(getPublicKey())}
              </label>
            )}
          </div>
          <SelectTokenDialog
            allTokens={data ?? []}
            selectToken={(token) => setValue("selectedToken", token)}
            selectedToken={selectedToken}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col gap-2">
          <label htmlFor="from" className="text-white font-thin text-sm">
            Amount
          </label>
          <div className="bg-[#1B2429] rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-[#29343a] w-[480px]">
            <input
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              className="text-[#9DB2BD] border-none outline-none text-2xl w-full font-light  "
              value={amountIn ?? ""}
              onChange={(e) => {
                const enforcedValue = enforcer(e.target.value);
                if (enforcedValue === null) return;
                setValue("amount", enforcedValue);
              }}
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
      {selectedToken && (
        <div className="self-stretch inline-flex justify-center items-start w-full mt-10">
          <div className="flex-1 px-4 py-3 bg-main_light rounded-xl flex justify-center items-center overflow-hidden max-w-[480px]">
            <div
              onClick={connectWallet}
              className="text-center justify-center text-main text-base font-normal font-['Inter'] leading-normal"
            >
              Connect wallet
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
