import { TransactionType } from './Transaction';

export interface LedgerEntry {
  id: string;
  date: Date;
  transactionId: string;
  asset: string;
  change: number;
  balance: number;
  averageCost?: number;
  platform: string;
  type: TransactionType;
}

export interface AssetLedger {
  asset: string;
  entries: LedgerEntry[];
  currentBalance: number;
  averageCost: number;
}

export {}; 