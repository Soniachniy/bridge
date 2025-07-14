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
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Asset } from "@/lib/1clickHelper";
import { Network } from "@/config";

export interface FormData {
  asset: Asset;
  network: Network | null;
  depositMethod: "wallet" | "exchange";
  amount: string;
  sourceWalletConnected: boolean;
  arbitrumWalletConnected: boolean;
  arbitrumAddress: string;
}

export default function HyperliquidBridge() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    asset: {
      assetId: "",
      symbol: "",
      decimals: 0,
      blockchain: "",
      price: 0,
      priceUpdatedAt: "",
      contractAddress: "",
    },
    network: null,
    depositMethod: "wallet",
    amount: "",
    sourceWalletConnected: false,
    arbitrumWalletConnected: false,
    arbitrumAddress: "",
  });
  const [showBridgeModal, setShowBridgeModal] = useState(false);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceedToStep2 =
    formData.asset &&
    formData.network &&
    formData.amount &&
    (formData.depositMethod === "exchange"
      ? formData.arbitrumWalletConnected
      : formData.sourceWalletConnected && formData.arbitrumWalletConnected);

  const steps = [
    {
      number: 1,
      title: "Swap to USDC",
      description: "Convert your assets to USDC on Arbitrum",
    },
    {
      number: 2,
      title: "Bridge to Hyperliquid",
      description: "Send USDC to Hyperliquid bridge",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-4 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">HyperDep</h1>
          <p className="text-gray-400">
            The simpliest way to hyperliquid deposit. Move your assets to
            Hyperliquid in two simple steps
          </p>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBridgeModal(true)}
              className="border-green-400 text-green-400 bg-gray-700 hover:bg-green-400 hover:text-gray-900"
            >
              <Zap className="w-4 h-4 mr-2" />
              Skip to Bridge (USDC Ready)
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? "bg-green-400 text-gray-900"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-white">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-600 mx-8 mt-[-2rem]" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Asset Swap */}
        {currentStep === 1 && (
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                Step 1: Swap to USDC on Arbitrum
                <Badge
                  variant="outline"
                  className="border-green-400 text-green-400"
                >
                  Swap
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Select your asset, network, and deposit method to convert to
                USDC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AssetSelection
                selectedAsset={formData.asset}
                onAssetChange={(asset) => updateFormData({ asset })}
              />

              <NetworkSelection
                selectedAsset={formData.asset}
                selectedNetwork={formData.network}
                onNetworkChange={(network) => updateFormData({ network })}
              />

              <DepositMethod
                formData={formData}
                onFormDataChange={updateFormData}
              />

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="min-w-32 bg-green-400 text-gray-900 hover:bg-green-500"
                >
                  Continue to Bridge
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Bridge to Hyperliquid */}
        {currentStep === 2 && (
          <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                Step 2: Bridge to Hyperliquid
                <Badge
                  variant="outline"
                  className="border-green-400 text-green-400"
                >
                  Bridge
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Connect to Arbitrum and send USDC to the Hyperliquid bridge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="font-medium text-green-400 mb-2">
                  Swap Summary
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Asset: {formData.asset.symbol}</div>
                  <div>Network: {formData.network}</div>
                  <div>Amount: {formData.amount}</div>
                  <div>
                    Method:{" "}
                    {formData.depositMethod === "wallet"
                      ? "Wallet"
                      : "Exchange"}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Ready to bridge your USDC to Hyperliquid
                </p>
                <Button
                  onClick={() => setShowBridgeModal(true)}
                  size="lg"
                  className="min-w-48 bg-green-400 text-gray-900 hover:bg-green-500"
                >
                  Open Bridge Interface
                </Button>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back to Swap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <BridgeModal open={showBridgeModal} onOpenChange={setShowBridgeModal} />
      </div>
    </div>
  );
}
