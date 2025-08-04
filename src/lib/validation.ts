import { z } from "zod";
import { TokenResponse } from "@defuse-protocol/one-click-sdk-typescript";

export const isValidEVMAddress = (address: string): boolean => {
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
};

const tonBase64Regex = /^[EU][A-Z0-9_-]{47,49}$/i;
const tonHexRegex = /^0:[a-fA-F0-9]{64}$/;

const tonAddressSchema = z
  .string()
  .refine((val) => tonBase64Regex.test(val) || tonHexRegex.test(val), {
    message:
      "Invalid TON address format. Must be a valid Base64 or hex address.",
  });

const nearAddressSchema = z.string().refine(
  (val) => {
    // Implicit account: exactly 64 characters, containing a-Z and 0-9
    const isImplicitAccount =
      val.length === 64 && /^[a-zA-Z0-9]{64}$/.test(val);

    // Named account: 2-64 characters with .near or .hot.tg suffix
    const isNearAccount = /^.{2,64}\.near$/.test(val);
    const isHotTgAccount = /^.{2,64}\.hot\.tg$/.test(val);

    return isImplicitAccount || isNearAccount || isHotTgAccount;
  },
  {
    message:
      "Must be a valid NEAR address: either 64 alphanumeric characters, or 2-64 characters with .near or .hot.tg suffix.",
  }
);

export const solanaAddressSchema = z.string().refine(
  (val) => {
    const isSolanaAddress =
      val.length === 44 && /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(val);
    return isSolanaAddress;
  },
  {
    message: "Must be a valid Solana address (44 characters)",
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
    hyperliquidAddress: z.string(),
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
          path: ["refundAddress"],
        });
      }
    } else if (ctx.value.selectedToken?.blockchain === "sol") {
      const solanaAddressParse = solanaAddressSchema.safeParse(
        ctx.value.refundAddress
      );
      if (!solanaAddressParse.success) {
        ctx.issues.push({
          code: "custom",
          message: "Address is not a valid Solana address",
          input: ctx.value.refundAddress,
          path: ["refundAddress"],
        });
      }
    } else if (ctx.value.selectedToken?.blockchain === "ton") {
      const tonAddressParse = tonAddressSchema.safeParse(
        ctx.value.refundAddress
      );
      if (!tonAddressParse.success) {
        ctx.issues.push({
          code: "custom",
          message: "Address is not a valid TON address",
          input: ctx.value.refundAddress,
          path: ["refundAddress"],
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
          path: ["refundAddress"],
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
