import { EStrategy } from "@/pages/Form";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";
import { Network } from "@/config";

export const ActionButton = ({
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
  const baseClasses =
    "flex-1 px-4 py-3 rounded-xl flex justify-center grow-1 items-center cursor-pointer overflow-hidden w-full max-w-[480px] text-base font-normal font-['Inter']";
  const variantClasses = {
    primary: "bg-main_light text-main",
    secondary: "text-main_light hover:bg-element text-main",
  };

  if (isSubmitButton) {
    return (
      <button
        type="submit"
        className="self-stretch inline-flex justify-center items-start w-full"
        disabled={disabled}
      >
        <div
          onClick={onClick}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
          <div className="text-center justify-center leading-normal cursor-pointer">
            {children}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="self-stretch inline-flex justify-center items-start w-full">
      <div
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        <div className="text-center justify-center leading-normal cursor-pointer">
          {children}
        </div>
      </div>
    </div>
  );
};
export default ActionButton;

export const renderActionButtons = (
  selectedToken: TokenResponse | null,
  strategy: EStrategy | null,
  setStrategy: (strategy: EStrategy) => void,
  connectWallet: (network?: Network) => void,
  isConnected: boolean,
  isSubmitting: boolean,
  isValidating: boolean,
  isConnectedEVMWallet: boolean
) => {
  if (!isConnectedEVMWallet) {
    return (
      <div className="mt-10 flex grow-1 w-full">
        <ActionButton
          variant="primary"
          onClick={() => connectWallet(Network.ARBITRUM)}
        >
          Connect EVM wallet
        </ActionButton>
      </div>
    );
  }
  if (!selectedToken) return null;
  if (strategy === EStrategy.SWAP && isConnected) {
    return (
      <>
        <div className="mt-10 flex grow-1 w-full">
          <ActionButton
            variant="primary"
            isSubmitButton
            disabled={isSubmitting || isValidating}
          >
            {isSubmitting || isValidating
              ? "Processing..."
              : "Proceed transfer"}
          </ActionButton>
        </div>
        <div className="mt-5 flex grow-1 w-full">
          <ActionButton
            variant="secondary"
            onClick={() => setStrategy(EStrategy.DEPOSIT)}
          >
            Send assets manually
          </ActionButton>
        </div>
      </>
    );
  }

  if (strategy === EStrategy.DEPOSIT) {
    return (
      <div className="mt-5 flex grow-1 w-full">
        <ActionButton
          variant="secondary"
          onClick={() => {
            setStrategy(EStrategy.SWAP);
            connectWallet();
          }}
        >
          Connect wallet
        </ActionButton>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 flex grow-1 w-full">
        <ActionButton
          variant="primary"
          onClick={() => {
            setStrategy(EStrategy.SWAP);
            connectWallet();
          }}
        >
          Connect wallet
        </ActionButton>
      </div>
      <div className="mt-5 flex grow-1 w-full">
        <ActionButton
          variant="secondary"
          onClick={() => setStrategy(EStrategy.DEPOSIT)}
        >
          Send assets manually
        </ActionButton>
      </div>
    </>
  );
};
