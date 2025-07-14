import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Copy, ExternalLink, CheckCircle } from "lucide-react";

interface BridgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BridgeModal({ open, onOpenChange }: BridgeModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [balance] = useState("1,250.50");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [txHash, setTxHash] = useState("");

  const bridgeAddress = "0xabcdef1234567890abcdef1234567890abcdef12";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleBridge = () => {
    // Simulate transaction
    setTxHash(
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    );
  };

  const handleMaxAmount = () => {
    setBridgeAmount(balance.replace(",", ""));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 w-full flex flex-col border-gray-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            Bridge to Hyperliquid
            <Badge variant="secondary" className="bg-green-400 text-gray-900">
              Arbitrum
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your Arbitrum wallet and bridge USDC to Hyperliquid
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isConnected ? (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Wallet className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="font-medium text-white">
                      Connect to Arbitrum
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Connect your wallet to view your USDC balance
                    </p>
                  </div>
                  <Button
                    onClick={handleConnect}
                    className="w-full bg-green-400 text-gray-900 hover:bg-green-500"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between text-white">
                    USDC Balance
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-400"
                    >
                      Connected
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    ${balance} USDC
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Available on Arbitrum
                  </p>
                </CardContent>
              </Card>

              {!txHash ? (
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">
                      Bridge Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bridge-amount" className="text-white">
                        Amount to Bridge
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="bridge-amount"
                          type="number"
                          placeholder="0.00"
                          value={bridgeAmount}
                          onChange={(e) => setBridgeAmount(e.target.value)}
                          className="bg-black border-white text-white placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="outline"
                          onClick={handleMaxAmount}
                          className="border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
                        >
                          Max
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-600" />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bridge Fee</span>
                        <span className="text-white">$2.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Gas Fee</span>
                        <span className="text-white">~$1.20</span>
                      </div>
                      <Separator className="bg-gray-600" />
                      <div className="flex justify-between font-medium">
                        <span className="text-white">You'll Receive</span>
                        <span className="text-green-400">
                          {bridgeAmount
                            ? `$${(
                                Number.parseFloat(bridgeAmount) - 3.7
                              ).toFixed(2)}`
                            : "$0.00"}{" "}
                          USDC
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBridge}
                      className="w-full bg-green-400 text-gray-900 hover:bg-green-500"
                      disabled={
                        !bridgeAmount || Number.parseFloat(bridgeAmount) <= 0
                      }
                    >
                      Bridge to Hyperliquid
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
                      <div>
                        <h3 className="font-medium text-green-400">
                          Bridge Successful!
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Your USDC is being bridged to Hyperliquid
                        </p>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                        <div className="text-xs text-gray-400 mb-1">
                          Transaction Hash
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-black px-2 py-1 rounded flex-1 truncate text-white border border-gray-600">
                            {txHash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(txHash)}
                            className="text-gray-300 hover:bg-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://arbiscan.io/tx/${txHash}`,
                                "_blank"
                              )
                            }
                            className="text-gray-300 hover:bg-gray-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-700 border-green-400/30">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-400">
                      Manual Bridge (Alternative)
                    </Label>
                    <p className="text-xs text-gray-300">
                      You can also manually send USDC to the bridge address:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={bridgeAddress}
                        readOnly
                        className="font-mono text-xs bg-black border-white text-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bridgeAddress)}
                        className="border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
