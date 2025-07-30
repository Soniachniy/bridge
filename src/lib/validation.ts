import { z } from "zod";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

export const isValidEVMAddress = (address: string): boolean => {
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
};

const nearAddressSchema = z.string().refine(
  (val) => {
    const isImplicitAccount = val.length === 64 && /^[0-9a-f]{64}$/.test(val);
    const isNamedAccount =
      /^(?=.{2,64}$)(?!.*[_.-]{2})[a-z0-9]+([._-]?[a-z0-9]+)*\.near$/.test(val);
    return isImplicitAccount || isNamedAccount;
  },
  {
    message:
      "Must be a valid .near address or a 64-character implicit account (hex).",
  }
);

export const evmAddressValidation = z
  .string()
  .min(1, "Address is required")
  .refine(isValidEVMAddress, {
    message: "Must be a valid EVM address (0x followed by 40 hex characters)",
  });

export const formValidationSchema = z
  .object({
    hyperliquidAddress: evmAddressValidation,
    refundAddress: z.string(),
    selectedToken: z
      .object({
        assetId: z.string(),
        symbol: z.string(),
        price: z.number(),
        priceUpdatedAt: z.string(),
        decimals: z.number(),
        contractAddress: z.string().optional(),
        blockchain: z.nativeEnum(TokenResponse.blockchain),
        balance: z.bigint(),
        balanceNear: z.bigint(),
        balanceUpdatedAt: z.number(),
      })
      .nullable()
      .refine((token) => token !== null, {
        message: "Please select a token",
      }),

    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
    amountOut: z.string().optional(),
    depositAddress: z.string().optional(),
    connectedEVMWallet: z.boolean(),
  })
  .check((ctx) => {
    if (ctx.value.selectedToken?.blockchain === "near") {
      const nearAddressParse = nearAddressSchema.safeParse(
        ctx.value.refundAddress
      );
      if (!nearAddressParse.success) {
        ctx.issues.push({
          code: "custom",
          message: "Address is not a valid .near address",
          input: ctx.value.refundAddress,
        });
      }
    } else {
      const evmAddressParse = evmAddressValidation.safeParse(
        ctx.value.refundAddress
      );
      if (!evmAddressParse.success) {
        ctx.issues.push({
          code: "custom",
          message: "Address is not a valid EVM address",
          input: ctx.value.refundAddress,
        });
      }
    }
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
        balance: bigint;
        balanceNear: bigint;
        balanceUpdatedAt: number;
      })
    | null;
  amount: string;
  hyperliquidAddress: string;
  refundAddress: string;
  amountOut?: string;
  depositAddress?: string;
  connectedEVMWallet: boolean;
}
