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
import { useQuery } from "@tanstack/react-query";
import { Asset, fetchTokens, getTokenIcon } from "@/lib/1clickHelper";

interface AssetSelectionProps {
  selectedAsset: Asset;
  onAssetChange: (asset: Asset) => void;
}

export function AssetSelection({
  selectedAsset,
  onAssetChange,
}: AssetSelectionProps) {
  const [open, setOpen] = useState(false);
  const { data, isSuccess, isFetched } = useQuery({
    queryKey: ["assetsList"],
    queryFn: fetchTokens,
  });

  const assets = isSuccess
    ? data.reduce((acc, asset) => {
        acc[asset.symbol] = asset;
        return acc;
      }, {} as Record<string, Asset>)
    : {};

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
            className="w-full justify-between bg-black border-white text-white hover:bg-gray-500"
          >
            {selectedAsset?.assetId ? (
              <span className="flex items-center gap-2">
                <img
                  src={getTokenIcon(selectedAsset.assetId)}
                  alt={selectedAsset.symbol}
                  className="w-6 h-6"
                />
                {selectedAsset.symbol}
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
                {isFetched &&
                  Object.values(assets).map((asset) => (
                    <CommandItem
                      key={asset.symbol}
                      value={asset.symbol}
                      onSelect={() => {
                        onAssetChange(asset);
                        setOpen(false);
                      }}
                      className="text-white hover:bg-white"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(asset.assetId)}
                          alt={asset.symbol}
                          className="w-6 h-6"
                        />
                        {asset.symbol}
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
