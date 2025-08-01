import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  SystemProgram,
  Transaction as TransactionSolana,
} from "@solana/web3.js";

import { basicConfig } from "@/config";

export const createTransferSolanaTransaction = (
  from: string,
  to: string,
  amount: bigint
): TransactionSolana => {
  const transaction = new TransactionSolana().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(from),
      toPubkey: new PublicKey(to),
      lamports: amount,
    })
  );
  return transaction;
};

export const createSPLTransferSolanaTransaction = (
  from: string,
  to: string,
  amount: bigint,
  token: string,
  ataExists: boolean
): TransactionSolana => {
  const fromPubkey = new PublicKey(from);
  const toPubkey = new PublicKey(to);
  const mintPubkey = new PublicKey(token);

  // Get associated token accounts for sender and receiver
  const fromATA = getAssociatedTokenAddressSync(mintPubkey, fromPubkey);
  const toATA = getAssociatedTokenAddressSync(mintPubkey, toPubkey);

  const transaction = new TransactionSolana();

  if (!ataExists) {
    // Add ATA creation - even if it exists, this will fail gracefully
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromPubkey,
        toATA,
        toPubkey,
        mintPubkey
      )
    );
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(fromATA, toATA, fromPubkey, amount)
  );

  return transaction;
};

const checkATAExists = async (
  connection: Connection,
  ataAddress: PublicKey
): Promise<boolean> => {
  try {
    await getAccount(connection, ataAddress);
    return true;
  } catch {
    return false;
  }
};

export const checkSolanaATARequired = async (
  depositAddress: string | null,
  isNativeToken: boolean,
  tokenAddress?: string
): Promise<boolean> => {
  if (isNativeToken || depositAddress === null || !tokenAddress) {
    return false;
  }

  const connection = new Connection(basicConfig.solanaConfig.endpoint);
  const toPubkey = new PublicKey(depositAddress);
  const mintPubkey = new PublicKey(tokenAddress);
  const toATA = getAssociatedTokenAddressSync(mintPubkey, toPubkey);

  const ataExists = await checkATAExists(connection, toATA);
  return !ataExists;
};

export async function getSplTokenBalance(
  userWalletAddress: PublicKey,
  tokenMintAddress?: string,
  rpcUrl = clusterApiUrl("mainnet-beta")
): Promise<number | null> {
  const connection = new Connection(rpcUrl, "confirmed");

  if (!tokenMintAddress) {
    const lamports = await connection.getBalance(userWalletAddress);
    const sol = lamports / 1e9;

    return sol;
  }
  const mint = new PublicKey(tokenMintAddress);

  try {
    const ata = await getAssociatedTokenAddress(mint, userWalletAddress);
    const tokenAccount = await getAccount(connection, ata);

    return Number(tokenAccount.amount);
  } catch (err: any) {
    if (err.message.includes("Failed to find account")) {
      return 0;
    }
    throw err;
  }
}
