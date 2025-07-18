import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

export async function getSplTokenBalance(
  userWalletAddress: string,
  tokenMintAddress?: string,
  rpcUrl = clusterApiUrl("mainnet-beta")
): Promise<number | null> {
  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new PublicKey(userWalletAddress);
  if (!tokenMintAddress) {
    const lamports = await connection.getBalance(wallet);
    const sol = lamports / 1e9;

    return sol;
  }
  const mint = new PublicKey(tokenMintAddress);

  try {
    const ata = await getAssociatedTokenAddress(mint, wallet);
    const tokenAccount = await getAccount(connection, ata);

    return Number(tokenAccount.amount);
  } catch (err: any) {
    if (err.message.includes("Failed to find account")) {
      return 0;
    }
    throw err;
  }
}
