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
        "select-none px-4 py-3 rounded-xl flex justify-center items-center cursor-pointer overflow-hidden text-base font-normal font-inter text-center leading-normal";
      const variantClasses = {
        primary: "bg-main_light text-main",
        secondary:
          "text-main_light text-base font-semibold font-['Inter'] bg-teal-200/10 hover:bg-teal-200/20",
        tertiary: "font-semibold hover:bg-yellow-200 bg-[#FFCC00] text-main",
        quaternary:
          "text-main_light text-base bg:transparent hover:bg-element text-main",
      };
      const disabledClasses = "opacity-50 cursor-not-allowed";
      return `${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? disabledClasses : ""
      }`;
    }, [variant, className, disabled]);

    return (
      <div onClick={disabled ? undefined : onClick} className={buttonClasses}>
        {children}
      </div>
    );
  }
);
