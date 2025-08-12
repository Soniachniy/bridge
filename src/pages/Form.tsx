import { useEffect, useMemo, useState } from "react";

import { translateNetwork } from "@/lib/1clickHelper";

import { enforcer, formatTokenAmount, isSupportedNetwork } from "@/lib/utils";
import SelectTokenDialog from "@/components/select-token-dialog";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import useNetwork from "@/hooks/useNetworkHandler";

import SuccessIcon from "@/assets/success-icon.svg?react";
import ErrorIcon from "@/assets/form-error-icon.svg?react";
import ManualIcon from "@/assets/manual.svg?react";

import { formValidationSchema, FormInterface } from "@/lib/validation";
import useSwapQuote from "@/hooks/useSwapQuote";

// import { useNavigate } from "react-router-dom";
import { Network } from "@/config";
import SlippageDialog from "@/components/slippage-dialog";
import DepositAddressSection from "@/components/DepositAddressSection";
import { SLIPPAGE } from "@/lib/constants";
import { useTokens } from "@/providers/token-context";
import useProcessing from "@/hooks/useProcessing";

import { BridgeFormMachineContext } from "@/providers/machine-provider";
import { InitialView } from "./states/Initial";
import { Status } from "@/components/status-indicator";
import { ProcessingStages } from "@/lib/states";
import { ConfirmationView } from "./states/Confirmation";
import { DepositView } from "./states/Deposit";

export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export enum EStrategy {
  Manual = "manual",
  Wallet = "wallet",
}

export default function Form() {
  const actorRef = BridgeFormMachineContext.useActorRef();

  // const navigate = useNavigate();
  const methods = useForm({
    resolver: zodResolver(formValidationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      amount: "",
      strategy: EStrategy.Wallet,
      amountOut: "0",
      selectedToken: null,
      hyperliquidAddress: "",
      refundAddress: "",
      depositAddress: "",
      slippageValue: SLIPPAGE,
      platformFee: "0",
      gasFee: "0",
    },
  });
  const selectedToken = useWatch({
    control: methods.control,
    name: "selectedToken",
  });
  const slippageValue = useWatch({
    control: methods.control,
    name: "slippageValue",
  });
  const amountIn = useWatch({ control: methods.control, name: "amount" });
  const amountOut = useWatch({ control: methods.control, name: "amountOut" });

  const hyperliquidAddress = useWatch({
    control: methods.control,
    name: "hyperliquidAddress",
  });
  const refundAddress = useWatch({
    control: methods.control,
    name: "refundAddress",
  });
  const depositAddress = useWatch({
    control: methods.control,
    name: "depositAddress",
  });

  const {} = useNetwork(translateNetwork(selectedToken?.blockchain));

  // useEffect(() => {
  //   const getSelectedTokenBalance = async () => {
  //     try {
  //       if (selectedToken && selectedToken.balanceUpdatedAt === 0) {
  //         const { balance, nearBalance } = await getBalance(
  //           selectedToken.assetId,
  //           selectedToken.contractAddress
  //         );
  //         if (balance) {
  //           setValue("selectedToken", {
  //             ...selectedToken,
  //             balance: balance,
  //             balanceNear: nearBalance,
  //             balanceUpdatedAt: Date.now(),
  //           });
  //         }
  //       }
  //     } catch (e) {
  //       console.log(e, "error while getting balance");
  //     }
  //   };

  //   getSelectedTokenBalance();
  // }, [selectedToken?.assetId]);

  // useEffect(() => {
  //   if (selectedToken) {
  //     const isSupported = isSupportedNetwork(
  //       translateNetwork(selectedToken.blockchain)
  //     );
  //     if (!isSupported) {
  //       setStrategy(EStrategy.DEPOSIT);
  //       actorRef.send({ type: "manual_deposit" });
  //     }
  //   }
  // }, [selectedToken]);

  const onSubmit = async () => {
    // TODO: Implement onSubmit
  };

  const view = BridgeFormMachineContext.useSelector((s) => s.value);

  const ViewByState: Record<string, React.ReactNode> = {
    Initial: <InitialView />,
    AssetSelection: <InitialView />,
    WalletConnection: <ConfirmationView />,
    DetailsReview: <DepositView />,
  };
  console.log("current view", view);

  return (
    <div className="p-4 w-full min-h-96">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="mb-2 text-center justify-start text-main_white text-4xl font-bold font-['Inter']">
          Deposit to Hyperliquid
        </div>
        <span className="mb-4 text-center justify-start text-main_white text-base font-normal font-['Inter'] leading-normal">
          Fastest way to trade on Hyperliquid Pers — from any chain.
        </span>
      </div>
      <Status localStage={view as ProcessingStages} />

      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-center items-center"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          {ViewByState[String(view)] ?? null}
        </form>
      </FormProvider>
      {/* 
        {selectedToken && (
          <>
            <div className="flex flex-col gap-2 mt-6 w-full md:w-[480px]">
              <label className="text-gray_text font-normal text-xs font-inter">
                Refund address
              </label>
              <div className="bg-element rounded-xl grow-1 p-3 flex flex-row justify-between items-center gap-7 md:w-[480px] h-12 sm:w-full">
                <div className="flex flex-col grow-1 gap-1 w-[210px]">
                  <div className="flex flex-row grow-1 items-center">
                    <input
                      type="text"
                      {...register("refundAddress")}
                      className="text-white border-none outline-none text-xs font-normal bg-transparent font-inter leading-none w-full"
                      placeholder="0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
                      autoComplete="off"
                      spellCheck="false"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-end items-center gap-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {refundAddress && errors.refundAddress && <ErrorIcon />}
                    {refundAddress &&
                      dirtyFields.refundAddress &&
                      !errors.refundAddress && <SuccessIcon />}
                  </div>
                  <div className="flex flex-row justify-end items-center gap-1">
                    <div
                      onClick={async () => {
                        const text =
                          await window.navigator.clipboard.readText();
                        setValue("refundAddress", text);
                        trigger("refundAddress");
                      }}
                      className="text-center cursor-pointer bg-main_light rounded-[5px] px-2 py-1 justify-center text-main text-xs font-normal font-['Inter'] leading-none"
                    >
                      paste
                    </div>
                  </div>
                </div>
              </div>
              {errors.refundAddress && (
                <div className="text-error word-break text-xs md:w-[480px] font-normal text-left  font-inter">
                  <span>{errors.refundAddress.message}</span>
                </div>
              )}
            </div>
          </>
        )}
        <DepositAddressSection
          selectedToken={selectedToken}
          strategy={strategy}
          connectedEVMWallet={connectedEVMWallet}
          depositAddress={depositAddress}
          errors={errors}
          debouncedAmountIn={debouncedAmountIn}
        />

        <ActionButtons
          selectedToken={selectedToken}
          strategy={strategy}
          setStrategy={wrappedSetStrategy}
          connectWallet={wrappedConnectWallet}
          isConnected={isConnected()}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          connectedEVMWallet={getPublicKey(Network.ARBITRUM) ?? null}
        />
        {/* Inline Processing Status */}
      {/* {depositAddress && <InlineProcessing depositAddress={depositAddress} />} */}
      {/* </form> */}
    </div>
  );
}
