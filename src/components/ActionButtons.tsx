import { memo, useCallback, useMemo } from "react";
import { EStrategy } from "@/pages/Form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Network } from "@/config";
import { getShortAddress, isSupportedNetwork } from "@/lib/utils";
import { translateNetwork } from "@/lib/1clickHelper";

const BUTTON_TEXTS = {
  connectEVM: "Connect EVM wallet",
  proceedTransfer: "Proceed transfer",
  processing: "Processing...",
  sendManually: "Send assets manually",
  getDepositAddress: "Get deposit address",
  connectWallet: "Connect wallet",
} as const;

const BUTTON_STYLES = {
  container: "flex grow-1 w-full",
  containerWithMargin: "mt-10 flex grow-1 w-full",
  containerWithGap:
    "mt-10 flex justify-center items-center flex-col gap-2 grow-1 w-full",
  containerColumn: "mt-5 flex flex-col grow-1 w-full gap-2",
  walletInfo:
    "justify-center max-w-[480px] text-gray_text text-xs font-normal font-inter leading-none",
} as const;

export const ActionButton = memo(
  ({
    onClick,
    children,
    variant = "secondary",
    className = "",
    isSubmitButton = false,
    disabled = false,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
    isSubmitButton?: boolean;
    disabled?: boolean;
  }) => {
    const buttonClasses = useMemo(() => {
      const baseClasses =
        "flex-1 px-4 py-3 rounded-xl flex justify-center items-center cursor-pointer overflow-hidden w-full max-w-[480px] text-base font-normal font-inter text-center leading-normal";
      const variantClasses = {
        primary: "bg-main_light text-main",
        secondary: "text-main_light hover:bg-element text-main",
      };
      return `${baseClasses} ${variantClasses[variant]} ${className}`;
    }, [variant, className]);

    const containerClasses =
      "self-stretch inline-flex justify-center items-start w-full";

    if (isSubmitButton) {
      return (
        <button
          type="submit"
          className={containerClasses}
          disabled={disabled}
          onClick={onClick}
        >
          <div className={buttonClasses}>{children}</div>
        </button>
      );
    }

    return (
      <div className={containerClasses}>
        <div onClick={onClick} className={buttonClasses}>
          {children}
        </div>
      </div>
    );
  }
);

interface ActionButtonsProps {
  selectedToken: TokenResponse | null;
  strategy: EStrategy | null;
  setStrategy: (strategy: EStrategy) => void;
  connectWallet: (network?: Network) => void;
  isConnected: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  connectedEVMWallet: string | null;
}

const ActionButtons = memo(
  ({
    selectedToken,
    strategy,
    setStrategy,
    connectWallet,
    isConnected,
    isSubmitting,
    isValidating,
    connectedEVMWallet,
  }: ActionButtonsProps) => {
    const handleConnectEVM = useCallback(() => {
      connectWallet(Network.ARBITRUM);
    }, [connectWallet]);

    const handleSwitchToDeposit = useCallback(() => {
      setStrategy(EStrategy.DEPOSIT);
    }, [setStrategy]);

    const handleSwitchToSwap = useCallback(() => {
      setStrategy(EStrategy.SWAP);
      connectWallet();
    }, [setStrategy, connectWallet]);

    const isTokenSupported = useMemo(() => {
      return selectedToken
        ? isSupportedNetwork(translateNetwork(selectedToken.blockchain))
        : false;
    }, [selectedToken]);

    const isProcessing = isSubmitting || isValidating;

    const walletConnected = Boolean(connectedEVMWallet);

    if (!walletConnected) {
      return (
        <div className={BUTTON_STYLES.containerWithMargin}>
          <ActionButton variant="primary" onClick={handleConnectEVM}>
            {BUTTON_TEXTS.connectEVM}
          </ActionButton>
        </div>
      );
    }

    if (!selectedToken || !isTokenSupported) {
      return null;
    }

    if (strategy === EStrategy.SWAP && isConnected) {
      return (
        <>
          <div className={BUTTON_STYLES.containerWithGap}>
            <ActionButton
              variant="primary"
              isSubmitButton
              disabled={isProcessing}
            >
              {isProcessing
                ? BUTTON_TEXTS.processing
                : BUTTON_TEXTS.proceedTransfer}
            </ActionButton>
            <div className={BUTTON_STYLES.walletInfo}>
              Connected EVM wallet [{getShortAddress(connectedEVMWallet!)}] will
              be used for your HyperLiquid deposit.
            </div>
          </div>
          <div className={BUTTON_STYLES.containerColumn}>
            <ActionButton variant="secondary" onClick={handleSwitchToDeposit}>
              {BUTTON_TEXTS.sendManually}
            </ActionButton>
          </div>
        </>
      );
    }

    if (strategy === EStrategy.DEPOSIT) {
      return (
        <div className={BUTTON_STYLES.containerColumn}>
          <ActionButton
            variant="primary"
            isSubmitButton
            disabled={isProcessing}
          >
            {BUTTON_TEXTS.getDepositAddress}
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleSwitchToSwap}>
            {BUTTON_TEXTS.connectWallet}
          </ActionButton>
        </div>
      );
    }

    return (
      <>
        <div className={BUTTON_STYLES.containerWithMargin}>
          <ActionButton variant="primary" onClick={handleSwitchToSwap}>
            {BUTTON_TEXTS.connectWallet}
          </ActionButton>
        </div>
        <div className={BUTTON_STYLES.containerColumn}>
          <ActionButton variant="secondary" onClick={handleSwitchToDeposit}>
            {BUTTON_TEXTS.sendManually}
          </ActionButton>
        </div>
      </>
    );
  }
);

export default ActionButtons;
