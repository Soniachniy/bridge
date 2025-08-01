import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PropsWithChildren, useMemo } from "react";

import { basicConfig } from "@/config";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
} from "@solana/spl-token";
import {
  createAssociatedTokenAccountInstruction,
  TokenInvalidOwnerError,
} from "@solana/spl-token";
import {
  Commitment,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaProvider = ({ children }: PropsWithChildren) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => basicConfig.solanaConfig.endpoint, [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={basicConfig.solanaConfig.wallets}
        autoConnect={basicConfig.solanaConfig.autoConnect}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  solanaAccount: string,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): Promise<{
  status: boolean;
  account: PublicKey | null;
  instruction: TransactionInstruction | null;
}> {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId
  );

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  let account: Account;
  try {
    account = await getAccount(
      connection,
      associatedToken,
      commitment,
      programId
    );
  } catch (error: unknown) {
    // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
    // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
    // TokenInvalidAccountOwnerError in this code path.
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      // As this isn't atomic, it's possible others can create associated accounts meanwhile.
      try {
        return {
          status: false,
          account: null,
          instruction: createAssociatedTokenAccountInstruction(
            new PublicKey(solanaAccount),
            associatedToken,
            owner,
            mint,
            programId,
            associatedTokenProgramId
          ),
        };
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }

      // Now this should always succeed
      account = await getAccount(
        connection,
        associatedToken,
        commitment,
        programId
      );
    } else {
      throw error;
    }
  }

  if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
  if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

  return {
    status: true,
    account: account.address,
    instruction: null,
  };
}
