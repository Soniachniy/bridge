import { memo, useMemo } from "react";

export const ActionButton = memo(
  ({
    onClick,
    children,
    variant = "secondary",
    className = "",
    disabled = false,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "tertiary" | "quaternary";
    className?: string;
    disabled?: boolean;
  }) => {
    const buttonClasses = useMemo(() => {
      const baseClasses =
        "flex-1 px-4 py-3 rounded-xl flex justify-center items-center cursor-pointer overflow-hidden w-full max-w-[480px] text-base font-normal font-inter text-center leading-normal";
      const variantClasses = {
        primary: "bg-main_light text-main",
        secondary: "text-main_light hover:bg-element text-main",
        tertiary: "font-semibold hover:bg-yellow-200 text-main bg-yellow-400",
        quaternary:
          "text-main_light text-base bg:transparent hover:bg-element text-main",
      };
      const disabledClasses = "opacity-50 cursor-not-allowed";
      return `${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? disabledClasses : ""
      }`;
    }, [variant, className, disabled]);

    const containerClasses =
      "self-stretch inline-flex justify-center items-start w-full";

    return (
      <div className={containerClasses}>
        <div onClick={onClick} className={buttonClasses}>
          {children}
        </div>
      </div>
    );
  }
);
