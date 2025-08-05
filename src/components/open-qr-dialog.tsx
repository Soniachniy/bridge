import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { QrcodeCanvas } from "react-qrcode-pretty";
import QRCodeIcon from "@/assets/qr-code-icon.svg?react";
import { Network } from "@/config";

function getUriPrefix(network: Network): string {
  switch (network) {
    case Network.BITCOIN:
      return "bitcoin";
    case Network.DOGE:
      return "dogecoin";
    case Network.ETHEREUM:
    case Network.ARBITRUM:
    case Network.AURORA:
    case Network.BASE:
    case Network.BERA:
    case Network.BNB:
    case Network.GNOSIS:
    case Network.POLYGON:
      return "ethereum";
    case Network.NEAR:
      return "near";
    case Network.SOLANA:
      return "solana";
    case Network.TON:
      return "ton";
    case Network.TRON:
      return "tron";
    case Network.XRP:
      return "xrpl";
    case Network.ZEC:
      return "zcash";
    default:
      return "";
  }
}

export default function OpenQrDialog({
  network,
  depositAddress,
  value,
}: {
  network: Network | null;
  depositAddress: string | null;
  value: string | null;
}) {
  const uriPrefix = getUriPrefix(network as Network);
  return (
    <Dialog>
      <DialogTrigger>
        <div className="cursor-pointer flex justify-start items-start">
          <div className="size- p-2 bg-main_light rounded-[10px] flex justify-center items-center overflow-hidden">
            <QRCodeIcon />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="border-none outline-none bg-transparent"
      >
        <div className="bg-main_dark self-stretch rounded-3xl p-6 inline-flex flex-col justify-start items-start gap-2">
          <div className="w-full">
            <div className="self-stretch flex flex-col justify-start items-center gap-2">
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className=" w-full justify-center text-center text-white text-base font-semibold font-['Inter'] leading-normal">
                  Scan QR
                </div>
              </div>
              <div className="self-stretch text-center justify-start text-main_white text-xs font-normal font-['Inter'] leading-none">
                Scan this code to get your deposit address.
              </div>
            </div>
          </div>
          <div className="flex justify-center w-full items-center">
            <QrcodeCanvas
              value={`${uriPrefix}:${depositAddress}?value=${value}`}
              variant={{
                eyes: "dots",
                body: "dots",
              }}
              color={{
                eyes: "#97FCE4",
                body: "#97FCE4",
              }}
              colorEffect={{
                eyes: "none",
                body: "none",
              }}
              padding={20}
              margin={20}
              size={300}
              bgColor="#1B2429"
              bgRounded
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
