import { clsx, type ClassValue } from "clsx";
import { ChangeEvent, SetStateAction, Dispatch } from "react";
import { twMerge } from "tailwind-merge";
import { parseUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const inputRegex = RegExp("^\\d*(?:\\\\[.])?\\d*$"); // match escaped "." characters via in a non-capturing group

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const enforcer = (event: string) => {
  const nextUserInput = event.replace(/,/g, ".");
  if (nextUserInput[0] === "." || nextUserInput[0] === ",") {
    return `0${nextUserInput}`;
  }
  if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
    return nextUserInput;
  }
  return null;
};

export function truncateAddress(address: string | undefined): string {
  if (!address) return "";
  if (address.length <= 16) return address;

  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

export interface Balance {
  amount: bigint | undefined;
  decimals: number | undefined;
}

export const validateBalance = (
  value: string,
  balance: Balance,
  required: boolean | undefined
) => {
  if (!required) return;
  if (!value || !balance.decimals || !balance.amount) return false;
  if (parseUnits(value, balance.decimals) > balance.amount) {
    return "Insufficient balance";
  }
  return;
};
