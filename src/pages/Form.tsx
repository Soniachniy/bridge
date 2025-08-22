import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formValidationSchema } from "@/lib/validation";

import { SLIPPAGE, USDC_DECIMALS } from "@/lib/constants";

import { BridgeFormMachineContext } from "@/providers/machine-provider";
import { InitialView } from "./states/Initial";
import { Status } from "@/components/status-indicator";
import { ProcessingStages } from "@/lib/states";

import { DepositView } from "./states/ManualDeposit";
import { ProcessingView } from "./states/Processing";
import { ConfirmationView } from "./states/Confirmation";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { getStatus } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";
import { formatTokenAmount } from "@/lib/utils";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
export enum EDepositMethod {
  WALLET = "wallet",
  EXCHANGE = "exchange",
}

export enum EStrategy {
  Manual = "manual",
  Wallet = "wallet",
}

export default function Form() {
  const { id: depositAddressFromParams } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();

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
          "nep141:tron-d28a265909efecdcee7c5028585214ea0b96f015.omft.near",
        blockchain: TokenResponse.blockchain.TRON,
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        decimals: 6,
        symbol: "USDT",
      },
      hyperliquidAddress: "",
      refundAddress: "",
      depositAddress: "",
      slippageValue: SLIPPAGE,
      platformFee: "0",
      gasFee: "0",
    },
  });

  const onSubmit = async () => {
    // TODO: Implement onSubmit
  };

  const view = BridgeFormMachineContext.useSelector((s) => s.value);

  const ViewByState: Record<string, React.ReactNode> = {
    [ProcessingStages.AssetSelection]: <InitialView />,
    [ProcessingStages.ManualDeposit]: <DepositView />,
    [ProcessingStages.DetailsReview]: <ConfirmationView />,
    [ProcessingStages.Processing]: <ProcessingView />,
    [ProcessingStages.AwaitingDeposit]: <ProcessingView />,
    [ProcessingStages.UserPermit]: <ProcessingView />,
    [ProcessingStages.ExecutingDeposit]: <ProcessingView />,
    [ProcessingStages.SuccessScreen]: <ProcessingView />,
  };

  useEffect(() => {
    if (depositAddressFromParams) {
      const getData = async () => {
        const statusResponse = await getStatus(depositAddressFromParams);
        if (
          !statusResponse.success ||
          statusResponse.data.status === "completed"
        ) {
          navigate("/");
        }
        if (
          statusResponse.data.status === "pending_deposit" ||
          statusResponse.data.status === "deposit_received" ||
          statusResponse.data.status === "processing" ||
          statusResponse.data.status === "ready_for_permit"
        ) {
          const selectedToken = tokens?.[statusResponse.data.assetFrom];
          if (selectedToken) {
            methods.setValue("selectedToken", {
              assetId: statusResponse.data.assetFrom,
              blockchain: selectedToken?.blockchain,
              decimals: selectedToken?.decimals,
              price: selectedToken?.price ?? 0,
              priceUpdatedAt: selectedToken?.priceUpdatedAt ?? "0",
              symbol: selectedToken?.symbol,
              balance: 0n,
              balanceNear: 0n,
              balanceUpdatedAt: 0,
            });
            methods.setValue("amount", statusResponse.data.amountIn);
            methods.setValue(
              "amountOut",
              formatTokenAmount(statusResponse.data.minAmountOut, USDC_DECIMALS)
            );
            methods.setValue(
              "hyperliquidAddress",
              statusResponse.data.hyperliquidAddress
            );
            methods.setValue(
              "refundAddress",
              statusResponse.data.refundAddress
            );

            methods.setValue(
              "depositAddress",
              statusResponse.data.depositAddress
            );
            actorRef.send({ type: "retry_processing" });
          }
        }
      };
      getData();
    }
  }, [depositAddressFromParams, tokens]);

  return (
    <div className="p-4 w-full min-h-96">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="mb-2 text-center justify-start text-main_white text-4xl font-bold font-['Inter']">
          Deposit to Hyperliquid from Any Chain
        </div>
        <span className="mb-4 text-center justify-start text-main_white text-base font-normal font-['Inter'] leading-normal">
          A fast and friendly way to top up your Hyperliquid account.
          <br /> We hide the complexity of bridges: just connect your wallet,
          pick an asset, and we do the rest.
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
    </div>
  );
}
