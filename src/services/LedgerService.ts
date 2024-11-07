import { Transaction } from '../types/Transaction';
import { LedgerEntry, AssetLedger } from '../types/Ledger';

export class LedgerService {
  private ledgers: Map<string, AssetLedger> = new Map();

  processTransaction(transaction: Transaction): LedgerEntry {
    const ledger = this.getOrCreateLedger(transaction.asset);
    
    const entry: LedgerEntry = {
      id: `${transaction.id}-ledger`,
      date: transaction.date,
      transactionId: transaction.id,
      asset: transaction.asset,
      change: this.calculateChange(transaction),
      balance: 0, // Will be calculated
      platform: transaction.platform,
      type: transaction.type
    };

    // Update running balance
    const previousBalance = ledger.currentBalance;
    const newBalance = previousBalance + entry.change;
    entry.balance = newBalance;

    // Update average cost basis for buys
    if (transaction.type === 'BUY' && transaction.price) {
      const previousValue = previousBalance * (ledger.averageCost || 0);
      const newValue = entry.change * transaction.price;
      ledger.averageCost = (previousValue + newValue) / newBalance;
      entry.averageCost = ledger.averageCost;
    }

    // Update ledger
    ledger.entries.push(entry);
    ledger.currentBalance = newBalance;
    this.ledgers.set(transaction.asset, ledger);

    return entry;
  }

  private calculateChange(transaction: Transaction): number {
    switch (transaction.type) {
      case 'BUY':
      case 'TRANSFER_IN':
      case 'STAKING_REWARD':
      case 'AIRDROP':
      case 'MINING':
        return transaction.amount;
      case 'SELL':
      case 'TRANSFER_OUT':
      case 'FEE':
        return -transaction.amount;
      default:
        return 0;
    }
  }

  private getOrCreateLedger(asset: string): AssetLedger {
    if (!this.ledgers.has(asset)) {
      this.ledgers.set(asset, {
        asset,
        entries: [],
        currentBalance: 0,
        averageCost: 0
      });
    }
    return this.ledgers.get(asset)!;
  }

  getLedger(asset: string): AssetLedger | undefined {
    return this.ledgers.get(asset);
  }

  getAllLedgers(): AssetLedger[] {
    return Array.from(this.ledgers.values());
  }

  calculateProfitLoss(transaction: Transaction): number | undefined {
    if (transaction.type !== 'SELL' || !transaction.price) return undefined;

    const ledger = this.ledgers.get(transaction.asset);
    if (!ledger || !ledger.averageCost) return undefined;

    const costBasis = ledger.averageCost * transaction.amount;
    const saleValue = transaction.price * transaction.amount;
    
    return saleValue - costBasis;
  }
}

export {}; 