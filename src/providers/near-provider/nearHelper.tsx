import Big from "big.js";
import { utils } from "near-api-js";

export interface ITransaction {
  receiverId: string;
  functionCalls: {
    gas?: string;
    amount?: string;
    methodName: string;
    args?: object;
  }[];
}
export const NEAR_TOKEN_ID = "NEAR";
export const NEAR_TOKEN_CONTRACT_ID = "wrap.near";
export const STORAGE_TO_REGISTER_FT = "0.1";
export const STORAGE_TO_REGISTER_WNEAR = "0.00125";
export const ONE_YOCTO_NEAR = "0.000000000000000000000001";

export const getGas = (gas?: string) =>
  gas ? new Big(gas) : new Big("100000000000000");
export const getAmount = (amount?: string) =>
  amount ? new Big(utils.format.parseNearAmount(amount) ?? 0) : new Big("0");

export const RESERVED_NEAR_BALANCE = 100000000000000000000000n;

export async function getStorageBalance({
  accountId,
  contractId,
  provider,
}: {
  accountId: string;
  contractId: string;
  provider: any;
}) {
  const currentBalance = await provider.viewFunction(
    "storage_balance_of",
    contractId,
    {
      account_id: accountId,
    }
  );
  if (!currentBalance) {
    const balanceBounds = await provider.viewFunction(
      "storage_balance_bounds",
      contractId,
      {}
    );
    return {
      total: currentBalance?.total ?? 0n,
      shouldDeposit: BigInt(balanceBounds.min),
    };
  }
  return {
    total: currentBalance?.total ?? 0n,
    shouldDeposit: 0n,
  };
}

export async function checkSwapStorageBalance({
  contractId,
  provider,
  depositAddress,
}: {
  contractId: string;
  depositAddress: string;
  provider: any;
}): Promise<{ tx: ITransaction[]; amount: bigint }> {
  const transactions: ITransaction[] = [];
  try {
    if (contractId === NEAR_TOKEN_ID) return { tx: [], amount: 0n };
    const storageAvailable = await getStorageBalance({
      accountId: depositAddress,
      contractId,
      provider,
    });

    if (storageAvailable.total === 0n || storageAvailable.shouldDeposit > 0n) {
      transactions.push({
        receiverId: contractId,
        functionCalls: [
          {
            methodName: "storage_deposit",
            args: {
              registration_only: true,
              account_id: depositAddress,
            },
            amount:
              contractId === NEAR_TOKEN_CONTRACT_ID
                ? STORAGE_TO_REGISTER_WNEAR
                : STORAGE_TO_REGISTER_FT,
          },
        ],
      });
    }
    return { tx: transactions, amount: storageAvailable.shouldDeposit };
  } catch (e) {
    return { tx: [], amount: 0n };
  }
}
