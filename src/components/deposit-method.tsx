import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Building2, Copy, CheckCircle } from "lucide-react";
import type { FormData } from "@/page";

interface DepositMethodProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

export function DepositMethod({
  formData,
  onFormDataChange,
}: DepositMethodProps) {
  const depositAddress = "0x1234567890123456789012345678901234567890";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSourceWalletConnect = () => {
    onFormDataChange({ sourceWalletConnected: true });
  };

  const handleArbitrumWalletConnect = () => {
    onFormDataChange({
      arbitrumWalletConnected: true,
      arbitrumAddress: "0xabcd...5678",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-white">Amount</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(e) => onFormDataChange({ amount: e.target.value })}
          className="bg-black border-white text-white placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-white">Deposit Method</Label>
        <RadioGroup
          value={formData.depositMethod}
          onValueChange={(value: "wallet" | "exchange") =>
            onFormDataChange({ depositMethod: value })
          }
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="wallet"
              id="wallet"
              className="peer sr-only"
            />
            <Label
              htmlFor="wallet"
              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-green-400 [&:has([data-state=checked])]:border-green-400 cursor-pointer text-white"
            >
              <Wallet className="mb-3 h-6 w-6" />
              From Wallet
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="exchange"
              id="exchange"
              className="peer sr-only"
            />
            <Label
              htmlFor="exchange"
              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-600 bg-gray-800 p-4 hover:bg-gray-700 hover:text-white peer-data-[state=checked]:border-green-400 [&:has([data-state=checked])]:border-green-400 cursor-pointer text-white"
            >
              <Building2 className="mb-3 h-6 w-6" />
              From Exchange
            </Label>
          </div>
        </RadioGroup>
      </div>

      {formData.depositMethod === "wallet" && (
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-white">Source Network Wallet</Label>
                <Button
                  onClick={handleSourceWalletConnect}
                  className={`w-full ${
                    formData.sourceWalletConnected
                      ? "bg-green-400 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  disabled={!formData.network}
                ></Button>
              </div>

              <div className="space-y-3">
                <Label className="text-white">
                  Arbitrum Wallet (Destination)
                </Label>
                <Button
                  onClick={handleArbitrumWalletConnect}
                  className={`w-full ${
                    formData.arbitrumWalletConnected
                      ? "bg-green-400 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {formData.arbitrumWalletConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Connected: {formData.arbitrumAddress}
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Arbitrum Wallet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.depositMethod === "exchange" && (
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-white">
                  Arbitrum Wallet (Destination)
                </Label>
                <Button
                  onClick={handleArbitrumWalletConnect}
                  className={`w-full ${
                    formData.arbitrumWalletConnected
                      ? "bg-green-400 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {formData.arbitrumWalletConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Connected: {formData.arbitrumAddress}
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Arbitrum Wallet
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Deposit Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={depositAddress}
                    readOnly
                    className="font-mono text-sm bg-black border-white text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(depositAddress)}
                    className="border-gray-600 text-gray-300 bg-gray-700 hover:bg-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Send your {formData.asset.symbol} from your exchange to this
                  address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
