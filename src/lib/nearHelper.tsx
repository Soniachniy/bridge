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

export async function getStorageBalance({
  accountId,
  contractId,
  provider,
}: {
  accountId: string;
  contractId: string;
  provider: any;
}) {
  return provider.viewFunction("storage_balance_of", contractId, {
    account_id: accountId,
  });
}

export async function checkSwapStorageBalance({
  contractId,
  provider,
  depositAddress,
}: {
  contractId: string;
  depositAddress: string;
  provider: any;
}) {
  const transactions: ITransaction[] = [];
  try {
    if (contractId === NEAR_TOKEN_ID) return [];
    const storageAvailable = await getStorageBalance({
      accountId: depositAddress,
      contractId,
      provider,
    });

    if (storageAvailable === null || storageAvailable.total === "0") {
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
    return transactions;
  } catch (e) {
    return [];
  }
}
