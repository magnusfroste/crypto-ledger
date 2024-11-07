import { Transaction } from '../../types/Transaction';

export interface WalletAdapter {
  getName(): string;
  getType(): 'csv' | 'api';
  parseTransactions(file: File): Promise<Transaction[]>;
}

export {};