"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const assets = [
  { value: "eth", label: "Ethereum (ETH)", icon: "⟠" },
  { value: "btc", label: "Bitcoin (BTC)", icon: "₿" },
  { value: "usdt", label: "Tether (USDT)", icon: "₮" },
  { value: "usdc", label: "USD Coin (USDC)", icon: "◎" },
  { value: "bnb", label: "BNB", icon: "◆" },
  { value: "sol", label: "Solana (SOL)", icon: "◉" },
  { value: "matic", label: "Polygon (MATIC)", icon: "⬟" },
  { value: "avax", label: "Avalanche (AVAX)", icon: "▲" },
  { value: "ton", label: "Toncoin (TON)", icon: "💎" },
  { value: "near", label: "NEAR Protocol", icon: "🔺" },
];

interface AssetSelectionProps {
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
}

export function AssetSelection({
  selectedAsset,
  onAssetChange,
}: AssetSelectionProps) {
  const [open, setOpen] = useState(false);

  const selectedAssetData = assets.find(
    (asset) => asset.value === selectedAsset
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="asset" className="text-white">
        Select Asset to Swap
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-black border-white text-white hover:bg-white"
          >
            {selectedAssetData ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedAssetData.icon}</span>
                {selectedAssetData.label}
              </span>
            ) : (
              "Select asset..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
          <Command className="bg-gray-800">
            <CommandInput
              placeholder="Search assets..."
              className="text-white"
            />
            <CommandList>
              <CommandEmpty className="text-gray-400">
                No asset found.
              </CommandEmpty>
              <CommandGroup>
                {assets.map((asset) => (
                  <CommandItem
                    key={asset.value}
                    value={asset.value}
                    onSelect={(currentValue) => {
                      onAssetChange(
                        currentValue === selectedAsset ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                    className="text-white hover:bg-white"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAsset === asset.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{asset.icon}</span>
                      {asset.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
