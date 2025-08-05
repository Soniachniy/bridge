import { memo, useCallback, useMemo } from "react";
import { FieldErrors } from "react-hook-form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Network } from "@/config";
import { translateNetwork } from "@/lib/1clickHelper";
import { isSupportedNetwork } from "@/lib/utils";
import { FormInterface } from "@/lib/validation";
import { EStrategy } from "@/pages/Form";
import CopyIcon from "@/assets/copy-icon.svg?react";
import OpenQrDialog from "@/components/open-qr-dialog";

const DEPOSIT_MESSAGES = {
  title: "Your deposit address.",
  subtitle: "Send assets manually to this address.",
  copyButton: "Copy address",
} as const;

const STYLES = {
  container: "self-stretch py-6 flex flex-col items-center gap-4",
  header: "flex flex-col items-center gap-1",
  title: "text-gray_text text-2xl font-normal font-inter leading-normal",
  subtitle: "text-gray_text text-xs font-normal font-inter leading-none",
  address:
    "text-center text-main_white text-sm font-normal font-inter leading-none break-all",
  actions: "flex items-start gap-2",
  copyButton:
    "cursor-pointer pl-2 pr-4 py-2 bg-main_light rounded-[10px] flex justify-center items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity",
  copyText: "text-black text-sm font-normal font-dm-sans leading-normal",
} as const;

interface DepositAddressSectionProps {
  selectedToken: TokenResponse | null;
  strategy: EStrategy | null;
  connectedEVMWallet: boolean;
  depositAddress: string | undefined;
  errors: FieldErrors<FormInterface>;
  debouncedAmountIn: string | null;
}

const DepositAddressSection = memo(
  ({
    selectedToken,
    strategy,
    connectedEVMWallet,
    depositAddress,
    errors,
    debouncedAmountIn,
  }: DepositAddressSectionProps) => {
    const network = useMemo(() => {
      return selectedToken ? translateNetwork(selectedToken.blockchain) : null;
    }, [selectedToken?.blockchain]);

    const shouldShowDepositSection = useMemo(() => {
      if (
        !connectedEVMWallet ||
        !depositAddress ||
        Object.keys(errors).length > 0
      ) {
        return false;
      }

      return (
        !network ||
        !isSupportedNetwork(network) ||
        strategy === EStrategy.DEPOSIT
      );
    }, [network, strategy, connectedEVMWallet, depositAddress, errors]);

    const handleCopyAddress = useCallback(async () => {
      if (depositAddress) {
        try {
          await navigator.clipboard.writeText(depositAddress);
        } catch (error) {
          console.error("Failed to copy address:", error);
        }
      }
    }, [depositAddress]);

    if (!shouldShowDepositSection) {
      return null;
    }

    return (
      <div className={STYLES.container}>
        <header className={STYLES.header}>
          <h3 className={STYLES.title}>{DEPOSIT_MESSAGES.title}</h3>
          <p className={STYLES.subtitle}>{DEPOSIT_MESSAGES.subtitle}</p>
        </header>

        <div className={STYLES.address} title={depositAddress}>
          {depositAddress}
        </div>

        {/* Action buttons */}
        <div className={STYLES.actions}>
          <button
            type="button"
            onClick={handleCopyAddress}
            className={STYLES.copyButton}
            aria-label="Copy deposit address to clipboard"
          >
            <CopyIcon aria-hidden="true" />
            <span className={STYLES.copyText}>
              {DEPOSIT_MESSAGES.copyButton}
            </span>
          </button>

          <OpenQrDialog
            network={network as Network}
            depositAddress={depositAddress!}
            value={debouncedAmountIn}
          />
        </div>
      </div>
    );
  }
);

DepositAddressSection.displayName = "DepositAddressSection";

export default DepositAddressSection;
