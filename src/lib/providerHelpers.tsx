import Big from "big.js";
import { utils } from "near-api-js";

export const getGas = (gas?: string) =>
  gas ? new Big(gas) : new Big("100000000000000");
export const getAmount = (amount?: string) =>
  amount ? new Big(utils.format.parseNearAmount(amount) ?? 0) : new Big("0");
