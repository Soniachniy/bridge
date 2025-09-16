import { z } from 'zod';
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript';
import { EStrategy } from '@/pages/Form';

export const MIN_AMOUNT = 5;

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
      'Invalid TON address format. Must be a valid Base64 or hex address.',
  });

export const tronHexAddress = z
  .string()
  .regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, 'Invalid TRON hex address');

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
      'Must be a valid NEAR address: either 64 alphanumeric characters, or 2-64 characters with .near or .hot.tg suffix.',
  },
);

export const solanaAddressSchema = z.string().refine(
  (val) => {
    const isSolanaAddress =
      val.length === 44 && /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(val);
    return isSolanaAddress;
  },
  {
    message: 'Must be a valid Solana address (44 characters)',
  },
);

export const evmAddressValidation = z
  .string()
  .min(1, 'Address is required')
  .refine(isValidEVMAddress, {
    message: 'Must be a valid EVM address (0x followed by 40 hex characters)',
  });

export const formValidationSchema = z
  .object({
    strategy: z.enum(['manual', 'wallet']),
    hyperliquidAddress: z.string(),
    refundAddress: z.string(),
    slippageValue: z.number(),
    platformFee: z.string(),
    gasFee: z.string(),
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
        message: 'Please select a token',
      }),

    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a valid positive number',
    }),
    amountOut: z.string(),
    depositAddress: z.string().optional(),
    txHash: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.strategy === 'wallet' &&
      data.selectedToken &&
      data.refundAddress
    ) {
      const decimals = data.selectedToken.decimals ?? 1;
      const balanceNumber =
        Number(data.selectedToken.balance) / Math.pow(10, decimals);
      const amountNumber = Number(data.amount);

      if (amountNumber > balanceNumber && amountNumber !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount cannot exceed your balance',
          path: ['amount'],
        });
      }
    }

    // Address validation based on blockchain
    if (data.refundAddress && data.selectedToken?.blockchain) {
      if (data.selectedToken.blockchain === 'near') {
        const nearAddressParse = nearAddressSchema.safeParse(
          data.refundAddress,
        );
        if (!nearAddressParse.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address is not a valid .near address',
            path: ['refundAddress'],
          });
        }
      } else if (data.selectedToken.blockchain === 'sol') {
        const solanaAddressParse = solanaAddressSchema.safeParse(
          data.refundAddress,
        );
        if (!solanaAddressParse.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address is not a valid Solana address',
            path: ['refundAddress'],
          });
        }
      } else if (data.selectedToken.blockchain === 'ton') {
        const tonAddressParse = tonAddressSchema.safeParse(data.refundAddress);
        if (!tonAddressParse.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address is not a valid TON address',
            path: ['refundAddress'],
          });
        }
      } else if (data.selectedToken.blockchain === 'tron') {
        if (!tronHexAddress.safeParse(data.refundAddress).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['refundAddress'],
            message: 'Address is not a valid TRON address',
          });
        }
      } else {
        const evmAddressParse = evmAddressValidation.safeParse(
          data.refundAddress,
        );
        if (!evmAddressParse.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address is not a valid EVM address',
            path: ['refundAddress'],
          });
        }
      }
    }
  });

export const createSlippageDialogValidationSchema = () =>
  z.object({
    slippageValue: z
      .number()
      .min(0, 'Slippage value must be between 0 and 100')
      .max(100, 'Slippage value must be between 0 and 100'),
  });

export const firstStepValidationSchema = formValidationSchema.pick({
  selectedToken: true,
  amount: true,
  amountOut: true,
  platformFee: true,
  gasFee: true,
});

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
  amountOut: string;
  depositAddress?: string;
  connectedEVMWallet: boolean;
  slippageValue: number;
  platformFee: string;
  gasFee: string;
  strategy: EStrategy;
  txHash?: string;
}
