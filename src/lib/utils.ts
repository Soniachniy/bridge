import { clsx, type ClassValue } from "clsx";
import { ChangeEvent, SetStateAction, Dispatch } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const inputRegex = RegExp("^\\d*(?:\\\\[.])?\\d*$"); // match escaped "." characters via in a non-capturing group

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const enforcer = (
  event: ChangeEvent<HTMLInputElement>,
  setValue: Dispatch<SetStateAction<string>>
) => {
  const nextUserInput = event.target.value.replace(/,/g, ".");
  if (nextUserInput[0] === "." || nextUserInput[0] === ",") {
    return setValue(`0${nextUserInput}`);
  }
  if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
    setValue(nextUserInput);
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
