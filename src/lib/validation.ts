import { z } from "zod";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

export const isValidEVMAddress = (address: string): boolean => {
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
};

export const evmAddressValidation = z
  .string()
  .min(1, "Address is required")
  .refine(isValidEVMAddress, {
    message: "Must be a valid EVM address (0x followed by 40 hex characters)",
  });

export const formValidationSchema = z.object({
  hyperliquidAddress: evmAddressValidation,
  refundAddress: evmAddressValidation,
  selectedToken: z
    .object({
      assetId: z.string(),
      symbol: z.string(),
      price: z.number(),
      priceUpdatedAt: z.string(),
      decimals: z.number(),
      contractAddress: z.string().optional(),
      blockchain: z.nativeEnum(TokenResponse.blockchain),
      balance: z.string(),
      balanceUpdatedAt: z.number(),
    })
    .nullable()
    .refine((token) => token !== null, {
      message: "Please select a token",
    }),

  amount: z
    .string()
    .min(
      5,
      "Amount too small after fees. Minimum deposit: $5 USDC after all fees."
    )
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
  amountOut: z.string().optional(),
  depositAddress: z.string().optional(),
});

export const createFormValidationSchema = (strategy: string | null) => {
  const baseSchema = formValidationSchema;
  if (strategy === "swap") {
    return baseSchema.refine(
      (data) => {
        const maxBalance =
          Number(data.selectedToken?.balance) /
          Math.pow(10, data.selectedToken?.decimals ?? 1);

        const amount = Number(data.amount);
        return amount <= maxBalance;
      },
      {
        message: `Amount cannot exceed your balance`,
        path: ["amount"],
      }
    );
  }

  return baseSchema;
};

export type FormValidationData = z.infer<FormInterface>;

export interface FormInterface {
  selectedToken:
    | (TokenResponse & {
        balance: string;
        balanceUpdatedAt: number;
      })
    | null;
  amount: string;
  hyperliquidAddress: string;
  refundAddress: string;
  amountOut: string;
  depositAddress: string;
}
