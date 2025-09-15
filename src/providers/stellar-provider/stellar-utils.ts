import {
  Horizon,
  Asset,
  Operation,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Memo,
} from 'stellar-sdk';
import { basicConfig } from '@/config';

export interface StellarAsset {
  code: string;
  issuer?: string;
  type: 'native' | 'credit_alphanum4' | 'credit_alphanum12';
}

export interface StellarTransactionParams {
  sourceAccount: string;
  destinationAccount: string;
  asset: StellarAsset;
  amount: string;
  memo?: string;
}

export class StellarUtils {
  private server: Horizon.Server;

  constructor() {
    this.server = new Horizon.Server(basicConfig.stellarConfig.horizonUrl);
  }

  async getAccountBalance(
    publicKey: string,
    assetCode?: string,
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      console.log('Account balances:', account.balances);
      if (!assetCode || assetCode === 'XLM') {
        return (
          account.balances.find(
            (balance: any) => balance.asset_type === 'native',
          )?.balance || '0'
        );
      }

      const balance = account.balances.find(
        (balance: any) =>
          balance.asset_type !== 'native' &&
          'asset_code' in balance &&
          balance.asset_code === assetCode,
      );

      return balance?.balance || '0';
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return '0';
    }
  }

  async getAccountBalances(
    publicKey: string,
  ): Promise<Array<{ code: string; balance: string; issuer?: string }>> {
    try {
      const account = await this.server.loadAccount(publicKey);

      return account.balances.map((balance) => {
        if (balance.asset_type === 'native') {
          return {
            code: 'XLM',
            balance: balance.balance,
          };
        } else {
          return {
            code: 'balance.asset_code',
            balance: balance.balance,
            issuer: 'balance.asset_issuer',
          };
        }
      });
    } catch (error) {
      console.error('Error fetching account balances:', error);
      return [];
    }
  }

  async buildPaymentTransaction(
    params: StellarTransactionParams,
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(params.sourceAccount);

      let asset: Asset;
      if (params.asset.type === 'native') {
        asset = Asset.native();
      } else {
        asset = new Asset(params.asset.code, params.asset.issuer!);
      }

      const operation = Operation.payment({
        destination: params.destinationAccount,
        asset: asset,
        amount: params.amount,
      });

      const transactionBuilder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
      });

      transactionBuilder.addOperation(operation);

      if (params.memo) {
        transactionBuilder.addMemo(Memo.text(params.memo));
      }

      transactionBuilder.setTimeout(300);

      const transaction = transactionBuilder.build();
      return transaction.toXDR();
    } catch (error) {
      console.error('Error building payment transaction:', error);
      throw error;
    }
  }

  async createTrustline(
    publicKey: string,
    asset: StellarAsset,
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(publicKey);

      const stellarAsset = new Asset(asset.code, asset.issuer!);

      const operation = Operation.changeTrust({
        asset: stellarAsset,
      });

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Error creating trustline transaction:', error);
      throw error;
    }
  }

  async submitTransaction(signedXdr: string): Promise<any> {
    try {
      const transaction = TransactionBuilder.fromXDR(
        signedXdr,
        Networks.PUBLIC,
      );
      const result = await this.server.submitTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }
}

export const stellarUtils = new StellarUtils();
