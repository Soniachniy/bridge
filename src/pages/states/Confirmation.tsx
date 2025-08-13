import { CHAIN_ICON, CHAIN_TITLE, getTokenIcon } from "@/lib/1clickHelper";
import { useFormContext } from "react-hook-form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { ActionButton } from "@/components/ActionButtons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTokenAmount } from "@/lib/utils";
import { USDC_DECIMALS } from "@/lib/constants";

import HyperliquidIcon from "@/assets/hyperliquid-icon.svg?react";
import useNetwork from "@/hooks/useNetworkHandler";
import { useTokens } from "@/providers/token-context";
import { FormInterface } from "@/lib/validation";

export const ConfirmationView = () => {
  const { watch } = useFormContext<FormInterface>();
  const tokens = useTokens();
  const { makeDeposit } = useNetwork(null);
  const selectedToken = watch("selectedToken");
  const amountOut = watch("amountOut");
  const amountIn: string = watch("amount");
  const depositAddress = watch("depositAddress");
  const platformFee = watch("platformFee");
  const gasFee = watch("gasFee");
  const refundAddress = watch("refundAddress");
  const hyperliquidAddress: string = watch("hyperliquidAddress");

  return (
    <>
      <div className="flex flex-col self-center inline-flex justify-between items-start mx-4 my-8 w-[480px] xs:w-full">
        <div className="size- inline-flex flex-row justify-between items-center gap-1 w-full my-auto bg-main_dark px-6 py-4 rounded-2xl">
          <div className="text-center justify-center text-main_light text-sm font-semibold font-['Inter'] leading-none">
            ≥{amountOut} USDC
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
        <div className="flex flex-col gap-4 w-full mt-4">
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset from:
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
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Asset to:
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="relative size-6 flex items-center">
                <img
                  src={getTokenIcon({ symbol: "USDC" } as TokenResponse)}
                  alt={"USDC"}
                  className="size-6 rounded-full"
                />
                <HyperliquidIcon className="absolute size-3 -bottom-1 -right-1 border border-black rounded-full" />
              </div>

              <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
                {selectedToken?.symbol}
              </div>
              <div className="text-center justify-center text-main_white text-[10px] font-normal font-['Inter'] leading-3">
                Hyperliquid
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Refund address:
            </div>
            <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-none">
              {refundAddress}
            </div>
          </div>
          <div className="flex flex-row justify-between w-full">
            <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
              Hyperliquid address:
            </div>
            <div className="justify-start text-white text-xs font-normal font-['Inter'] leading-none">
              {hyperliquidAddress}
            </div>
          </div>
        </div>
      </div>
      <ActionButton
        variant="primary"
        className="w-full"
        onClick={() => {
          if (!selectedToken || !depositAddress || !amountIn) {
            return;
          }
          makeDeposit(
            selectedToken,
            depositAddress,
            amountIn,
            tokens[selectedToken?.assetId].decimals,
            { balance: 0n, nearBalance: 0n }
          );
        }}
      >
        Confirm deposit
      </ActionButton>
    </>
  );
};

// export const ConnectButton = ({
//   selectedBlockchain,
//   connectWallet,
//   evmAddress,
// }: {
//   selectedBlockchain: TokenResponse.blockchain | undefined;
//   connectWallet: (network: Network) => void;
//   evmAddress?: string;
// }) => {
//   const actorRef = BridgeFormMachineContext.useActorRef();
//   const { setValue } = useFormContext();

//   if (!evmAddress) {
//     return (
//       <>
//         <ActionButton
//           variant="primary"
//           onClick={() => connectWallet(Network.ARBITRUM)}
//           className="w-full"
//         >
//           Connect EVM wallet
//         </ActionButton>
//         <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
//           Your wallet will be used to sign off-chain messages as part of the
//           process.
//         </div>
//       </>
//     );
//   }
//   if (!isSupportedNetwork(translateNetwork(selectedBlockchain))) {
//     return (
//       <>
//         <div className="my-2 w-full flex flex-row items-center justify-center gap-2">
//           <WalletIcon stroke={"#50D2C1"} />
//           <span className="justify-center text-main_light text-base font-normal font-['Inter'] leading-normal">
//             {truncateAddress(evmAddress)}
//           </span>
//         </div>
//         <ActionButton
//           variant="primary"
//           onClick={() => {
//             setValue("strategy", EStrategy.Manual);
//             actorRef.send({ type: "manual_deposit" });
//           }}
//           className="w-full"
//         >
//           Proceed with external wallets
//         </ActionButton>
//         <div className=" mt-4 self-stretch px-4 py-2 bg-teal-200/10 rounded-2xl inline-flex justify-start items-center gap-2">
//           <div className="size-6 relative flex items-center justify-center">
//             <InfoIcon stroke="#97FCE4" />
//           </div>
//           <div className="flex-1 justify-start text-main_light text-xs font-normal font-['Inter'] leading-none">
//             Your wallet is connected, but we don't currently support the
//             selected chain for automated deposits.
//           </div>
//         </div>
//       </>
//     );
//   }
//   if (evmAddress && isEVMNetwork(translateNetwork(selectedBlockchain))) {
//     return (
//       <>
//         <div className="my-2 w-full flex flex-row items-center justify-center gap-2">
//           <WalletIcon stroke={"#50D2C1"} />
//           <span className="justify-center text-main_light text-base font-normal font-['Inter'] leading-normal">
//             {truncateAddress(evmAddress)}
//           </span>
//         </div>
//         <ActionButton
//           variant="primary"
//           onClick={() => actorRef.send({ type: "connect_wallet" })}
//           className="w-full"
//         >
//           Continue
//         </ActionButton>
//         <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
//           Connected EVM wallet [{truncateAddress(evmAddress)}] will be used for
//           your HyperLiquid deposit.
//         </div>
//         <div className="my-8 self-stretch text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
//           or
//         </div>
//         <ActionButton
//           variant="secondary"
//           className="w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-main_light"
//           onClick={() => {
//             setValue("strategy", EStrategy.Manual);
//             actorRef.send({ type: "manual_deposit" });
//           }}
//         >
//           Send from external wallets
//         </ActionButton>
//         <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
//           Send assets manually if you prefer to deposit from external wallet or
//           CEX
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="my-2 w-full flex flex-row items-center justify-center gap-2">
//         <WalletIcon stroke={"#50D2C1"} />
//         <span className="justify-center text-main_light text-base font-normal font-['Inter'] leading-normal">
//           {truncateAddress(evmAddress)}
//         </span>
//       </div>
//       <ActionButton
//         variant="primary"
//         onClick={() =>
//           connectWallet(
//             translateNetwork(selectedBlockchain ?? TokenResponse.blockchain.ETH)
//           )
//         }
//         className="w-full"
//       >
//         {`Connect ${
//           CHAIN_TITLE[selectedBlockchain ?? TokenResponse.blockchain.ETH]
//         } wallet`}
//       </ActionButton>
//       <div className=" mt-4 self-stretch px-4 py-2 bg-teal-200/10 rounded-2xl inline-flex justify-start items-center gap-2">
//         <div className="size-6 relative flex items-center justify-center">
//           <InfoIcon stroke="#97FCE4" />
//         </div>
//         <div className="flex-1 justify-start text-main_light text-xs font-normal font-['Inter'] leading-none">
//           Your wallet is connected, but we don't currently support the selected
//           chain for automated deposits.
//         </div>
//       </div>
//       <div className="my-8 self-stretch text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
//         or
//       </div>
//       <ActionButton
//         variant="secondary"
//         className="w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-main_light"
//         onClick={() => {
//           setValue("strategy", EStrategy.Manual);
//           actorRef.send({ type: "manual_deposit" });
//         }}
//       >
//         Send from external wallets
//       </ActionButton>
//       <div className=" mt-2 text-center justify-center text-gray_text text-xs font-normal font-['Inter'] leading-none">
//         Send assets manually if you prefer to deposit from external wallet or
//         CEX
//       </div>
//     </>
//   );
// };

// <div className="flex flex-col md:w-[480px] sm:w-full">
//   <div
//     className="flex flex-row gap-1 items-start cursor-pointer"
//     onClick={() => {
//       actorRef.send({ type: "back" });
//     }}
//   >
//     <ArrowLeftIcon />
//     <span className="text-center justify-center text-main_light text-xs font-normal font-['Inter'] leading-none">
//       Change asset or amount
//     </span>
//   </div>
//   <div className="mt-4 self-stretch p-6 rounded-2xl outline outline-1 outline-offset-[-1px] outline-element flex flex-col justify-start items-center gap-7">
//     <div className="flex flex-row justify-between w-full">
//       <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
//         Asset:
//       </div>
//       <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
//         {selectedToken && (
//           <div className="flex flex-row items-center gap-2">
//             <div className="relative size-6 flex items-center">
//               <img
//                 src={getTokenIcon(selectedToken)}
//                 alt={selectedToken?.assetId ?? "token"}
//                 className="size-6 rounded-full"
//               />
//               <img
//                 src={CHAIN_ICON[selectedToken?.blockchain]}
//                 alt={selectedToken?.blockchain ?? "blockchain"}
//                 className="absolute size-3 -bottom-1 -right-1 border border-white rounded-full"
//               />
//             </div>

//             <div className="flex flex-col">
//               <div className="text-left justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
//                 {selectedToken?.symbol}
//               </div>
//               <div className="text-left justify-center text-gray_text text-[10px] font-normal font-['Inter'] leading-3">
//                 {CHAIN_TITLE[selectedToken?.blockchain]}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     <div className="flex flex-row justify-between w-full">
//       <div className="justify-start text-gray_text text-xs font-normal font-['Inter'] leading-none">
//         Amount:
//       </div>
//       <div className="text-center justify-center text-main_white text-xs font-semibold font-['Inter'] leading-none">
//         {amountIn} {selectedToken?.symbol}
//       </div>
//     </div>
//   </div>
//   <div className="self-stretch inline-flex justify-between items-start mx-4 my-8">
//     <div className="justify-start text-main_white text-xs font-semibold font-['Inter'] leading-none">
//       You'll receive:
//     </div>
//     <div className="size- inline-flex flex-col justify-center items-end gap-1">
//       <div className="text-center justify-center text-main_light text-sm font-semibold font-['Inter'] leading-none">
//         ≥{amountOut} USDC
//       </div>

//       <div className="text-center justify-center text-white text-xs font-normal font-['Inter'] leading-none">
//         in Hyperliquid perps{" "}
//         <TooltipProvider>
//           <Tooltip delayDuration={150}>
//             <TooltipTrigger asChild>
//               <span className="text-gray_text  cursor-help">
//                 (includes fees)
//               </span>
//             </TooltipTrigger>
//             <TooltipContent
//               side="top"
//               align="end"
//               className="text-xs bg-black border-none px-4 py-4"
//             >
//               <div className="flex text-left text-white  flex-col gap-1">
//                 <div>
//                   Gas fee:{" "}
//                   <span className="text-main_light ">
//                     {formatTokenAmount(gasFee, USDC_DECIMALS)} USDC
//                   </span>
//                 </div>
//                 <div>
//                   Platform fee:{" "}
//                   <span className="text-main_light">
//                     {formatTokenAmount(platformFee, USDC_DECIMALS)} USDC
//                   </span>
//                 </div>
//               </div>
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       </div>
//     </div>
//   </div>
//   <ConnectButton
//     connectWallet={connectWallet}
//     selectedBlockchain={selectedToken?.blockchain}
//     evmAddress={watch("hyperliquidAddress")}
//   />
// </div>;
