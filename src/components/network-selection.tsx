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
import { ChevronsUpDown } from "lucide-react";

import {
  Asset,
  fetchTokens,
  getNetworkIcon,
  NetworkIconMap,
  translateNetwork,
} from "@/lib/1clickHelper";
import { useQuery } from "@tanstack/react-query";
import { Network } from "@/config";

interface NetworkSelectionProps {
  selectedAsset: Asset;
  selectedNetwork: Network | null;
  onNetworkChange: (network: Network | null) => void;
}

export function NetworkSelection({
  selectedAsset,
  selectedNetwork,
  onNetworkChange,
}: NetworkSelectionProps) {
  const [open, setOpen] = useState(false);

  const { data, isSuccess } = useQuery({
    queryKey: ["assetsList"],
    queryFn: fetchTokens,
  });

  const networks = isSuccess
    ? data?.filter((asset) => asset.symbol === selectedAsset.symbol)
    : [];

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
            {selectedNetwork ? (
              <span className="flex items-center gap-2">
                {NetworkIconMap[selectedNetwork]}
                {selectedNetwork}
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
                    key={network.blockchain}
                    value={network.blockchain}
                    onSelect={() => {
                      onNetworkChange(translateNetwork(network.blockchain));
                      setOpen(false);
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      {getNetworkIcon(network.blockchain)}
                      {translateNetwork(network.blockchain)}
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
