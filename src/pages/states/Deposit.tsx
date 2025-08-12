import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHAIN_ICON, CHAIN_TITLE, getTokenIcon } from "@/lib/1clickHelper";
import { USDC_DECIMALS } from "@/lib/constants";
import { formatTokenAmount } from "@/lib/utils";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { useFormContext } from "react-hook-form";

export const DepositView = () => {
  const { watch } = useFormContext();

  const amountIn: number | undefined = watch("amount");
  const amountOut: number | undefined = watch("amountOut");
  const selectedToken: TokenResponse | undefined = watch("selectedToken");
  const platformFee: string = watch("platformFee");
  const gasFee: string = watch("gasFee");

  return (
    <div className="flex flex-col md:w-[480px] sm:w-full gap-4">
      <div className="mt-4 self-stretch p-6 rounded-2xl outline outline-1 outline-offset-[-1px] outline-element flex flex-col justify-start items-center">
        <div className="text-center justify-center text-main_light text-2xl font-bold font-['Inter'] leading-normal">
          {amountIn} {selectedToken?.symbol}
        </div>
        <div className="text-center justify-center text-white text-xs font-normal font-['Inter'] leading-none">
          in Hyperliquid perps{" "}
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <span className="text-gray_text  cursor-help">
                  (includes fees)
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="end"
                className="text-xs bg-black border-none px-4 py-4"
              >
                <div className="flex text-left text-white  flex-col gap-1">
                  <div>
                    Gas fee:{" "}
                    <span className="text-main_light ">
                      {formatTokenAmount(gasFee, USDC_DECIMALS)} USDC
                    </span>
                  </div>
                  <div>
                    Platform fee:{" "}
                    <span className="text-main_light">
                      {formatTokenAmount(platformFee, USDC_DECIMALS)} USDC
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
          Asset:
        </div>
        <div className="flex flex-row items-center gap-2">
          {selectedToken && (
            <div className="relative size-6 flex items-center">
              <img
                src={getTokenIcon(selectedToken)}
                alt={selectedToken?.assetId ?? "token"}
                className="size-6 rounded-full"
              />
              <img
                src={CHAIN_ICON[selectedToken?.blockchain]}
                alt={selectedToken?.blockchain ?? "blockchain"}
                className="absolute size-3 -bottom-1 -right-1 border border-white rounded-full"
              />
            </div>
          )}
          <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
            {selectedToken?.symbol}
          </div>
          <div className="text-center justify-center text-main_white text-[10px] font-normal font-['Inter'] leading-3">
            {
              CHAIN_TITLE[
                selectedToken?.blockchain ?? TokenResponse.blockchain.ETH
              ]
            }
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
          Asset:
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none"></div>
        </div>
      </div>
    </div>
  );
};
