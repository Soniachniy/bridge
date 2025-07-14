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

const networks = [
  { value: "ethereum", label: "Ethereum", icon: "⟠", walletType: "EVM" },
  { value: "bsc", label: "BNB Smart Chain", icon: "◆", walletType: "EVM" },
  { value: "polygon", label: "Polygon", icon: "⬟", walletType: "EVM" },
  { value: "avalanche", label: "Avalanche", icon: "▲", walletType: "EVM" },
  { value: "solana", label: "Solana", icon: "◉", walletType: "Solana" },
  { value: "optimism", label: "Optimism", icon: "🔴", walletType: "EVM" },
  { value: "base", label: "Base", icon: "🔵", walletType: "EVM" },
  { value: "ton", label: "TON", icon: "💎", walletType: "TON" },
  { value: "near", label: "NEAR", icon: "🔺", walletType: "NEAR" },
];

interface NetworkSelectionProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

export function NetworkSelection({
  selectedNetwork,
  onNetworkChange,
}: NetworkSelectionProps) {
  const [open, setOpen] = useState(false);

  const selectedNetworkData = networks.find(
    (network) => network.value === selectedNetwork
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="network" className="text-white">
        Select Source Network
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-black border-white text-white hover:bg-white"
          >
            {selectedNetworkData ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedNetworkData.icon}</span>
                {selectedNetworkData.label}
              </span>
            ) : (
              "Select network..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600">
          <Command className="bg-gray-800">
            <CommandInput
              placeholder="Search networks..."
              className="text-white"
            />
            <CommandList>
              <CommandEmpty className="text-gray-400">
                No network found.
              </CommandEmpty>
              <CommandGroup>
                {networks.map((network) => (
                  <CommandItem
                    key={network.value}
                    value={network.value}
                    onSelect={(currentValue) => {
                      onNetworkChange(
                        currentValue === selectedNetwork ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    <Check
                      color="white"
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedNetwork === network.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{network.icon}</span>
                      {network.label}
                      <span className="text-xs text-gray-400 ml-auto">
                        {network.walletType}
                      </span>
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
