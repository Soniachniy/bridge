// export const BasicInfo = ({
//   stage,
//   initialData,
//   signPermit,
// }: {
//   stage: ProcessingStages;
//   initialData?: {
//     selectedToken: TokenResponse;
//     amountIn: bigint;
//     amountOut: bigint;
//     depositAddress: string;
//   } | null;
//   signPermit: (depositAddress: string) => Promise<void>;
// }) => {

//   if (!initialData) {
//     return null;
//   }
//   return (
//     <div className="m-auto p-4 flex flex-col gap-2 justify-center align-center w-full md:w-[480px]">
//       <div className="text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
//         From
//       </div>
//       <div className="flex flex-row gap-6 border min-h-[75px] border-element rounded-lg p-2 px-4">
//         <div className="relative h-[55px] flex items-center">
//           <img
//             src={getTokenIcon(initialData?.selectedToken)}
//             alt={initialData?.selectedToken?.assetId ?? "token"}
//             className="size-12 rounded-full"
//           />
//           <img
//             src={CHAIN_ICON[initialData?.selectedToken?.blockchain]}
//             alt={initialData?.selectedToken?.blockchain ?? "blockchain"}
//             className="absolute size-4 -bottom-1 -right-1 border border-white rounded-full"
//           />
//         </div>
//         <div className="flex flex-1 flex-col justify-between py-2">
//           <p className="text-left  text-main_white text-base font-semibold font-['Inter'] leading-normal">
//             {initialData?.selectedToken?.symbol}
//           </p>
//           <p className="text-left text-main_white text-xs font-normal font-['Inter'] leading-none">
//             {CHAIN_TITLE[initialData?.selectedToken?.blockchain]}
//           </p>
//         </div>
//       </div>
//       <div className="mt-4 text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
//         Amount
//       </div>
//       <div className="flex flex-col gap-2 border min-h-[75px] border-element rounded-lg p-2 px-4">
//         <div className="flex grow-1 flex-row items-center gap-7">
//           <span
//             className={`text-white grow-1 border-none outline-none text-2xl font-light bg-transparent font-inter leading-none`}
//           >
//             {formatTokenAmount(
//               initialData?.amountIn,
//               initialData?.selectedToken?.decimals
//             )}
//           </span>
//         </div>
//         <div className="flex flex-row gap-1 justify-between">
//           <span className="text-white text-xs font-light font-inter leading-[14px]">
//             <span className="text-white text-xs font-light font-inter leading-[14px]">
//               At least $
//               {formatTokenAmount(initialData?.amountOut, USDC_DECIMALS)} USDC
//             </span>
//           </span>
//         </div>
//       </div>
//       <div className="mt-4 text-left justify-start text-main_white text-gray_text text-xs font-normal font-['Inter'] leading-normal">
//         Deposit address
//       </div>
//       <div className="flex flex-col gap-2 border border-element rounded-lg p-2 px-4">
//         <div className="flex grow-1 flex-row items-center gap-7">
//           <span
//             className={`text-white grow-1 border-none whitespace-nowrap overflow-hidden text-ellipsis outline-none text-main_white text-sm font-light bg-transparent font-inter leading-none`}
//           >
//             {initialData?.depositAddress}
//           </span>
//           {stage === ProcessingStages.DepositReceived && (
//             <button
//               onClick={handleCopyAddress}
//               className=" text-xs text-center font-normal font-['Inter'] leading-normal cursor-pointer bg-main_light rounded-md px-2 py-1"
//             >
//               Copy
//             </button>
//           )}
//         </div>
//       </div>
//       {stage === ProcessingStages.ReadyForPermit ? (
//         <ActionButton
//           variant="primary"
//           className="mt-4"
//           onClick={() => signPermit(initialData?.depositAddress)}
//         >
//           Sign Permit
//         </ActionButton>
//       ) : (
//         <ActionButton variant="primary" className="mt-4">
//           Support
//         </ActionButton>
//       )}
//       <span className="text-main_white text-xs text-center font-normal font-['Inter'] leading-normal">
//         Go back to use HyperDep and deposit more assets.
//       </span>
//     </div>
//   );
// };
