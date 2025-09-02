import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formValidationSchema } from "@/lib/validation";

import { SLIPPAGE, USDC_DECIMALS } from "@/lib/constants";

import { BridgeFormMachineContext } from "@/providers/machine-provider";
import { InitialView } from "./states/Initial";

import { ProcessingStages } from "@/lib/states";

import { DepositView } from "./states/ManualDeposit";
import { ProcessingView } from "./states/Processing";
import { WalletDepositView } from "./states/WalletDeposit";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { getStatus } from "@/providers/proxy-provider";
import { useTokens } from "@/providers/token-context";
import { formatTokenAmount } from "@/lib/utils";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

import useProcessing from "@/hooks/useProcessing";

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

  const onSubmit = async () => {
    // TODO: Implement onSubmit
  };

  const view = BridgeFormMachineContext.useSelector(
    (s) => s.value
  ) as ProcessingStages;
  const depositAddress = methods.watch("depositAddress");

  const { signPermit, currentStage } = useProcessing(depositAddress);

  const ViewByState: Record<string, React.ReactNode> = {
    [ProcessingStages.AssetSelection]: <InitialView />,
    [ProcessingStages.ManualDeposit]: <DepositView />,
    [ProcessingStages.WalletDeposit]: <WalletDepositView />,
    [ProcessingStages.Processing]: (
      <ProcessingView signPermit={signPermit} currentStage={currentStage} />
    ),
    [ProcessingStages.SuccessScreen]: (
      <ProcessingView signPermit={signPermit} currentStage={currentStage} />
    ),
  };

  useEffect(() => {
    if (depositAddressFromParams) {
      const getData = async () => {
        const statusResponse = await getStatus(depositAddressFromParams);
        if (
          !statusResponse.success ||
          statusResponse.data.status === "completed" ||
          statusResponse.data.status === "pending_deposit"
        ) {
          navigate("/");
        }
        if (
          Object.keys(tokens).length !== 0 &&
          (statusResponse.data.status === "deposit_received" ||
            statusResponse.data.status === "processing" ||
            statusResponse.data.status === "ready_for_permit")
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
            methods.setValue(
              "amount",
              formatTokenAmount(
                statusResponse.data.amountIn,
                selectedToken?.decimals
              )
            );
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
            methods.setValue("txHash", statusResponse.data.txHash);
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
