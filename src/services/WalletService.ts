import { BinanceTradeAdapter } from './adapters/BinanceTradeAdapter';
import { BinanceCSVAdapter } from './adapters/BinanceCSVAdapter';
import { BlockchainCSVAdapter } from './adapters/BlockchainCSVAdapter';
import { GenericCSVAdapter } from './adapters/GenericCSVAdapter';
import { Transaction } from '../types/Transaction';

export class WalletService {
  static async parseCSV(file: File, platform: string, walletName?: string): Promise<Transaction[]> {
    const adapter = this.getAdapter(platform, walletName);
    return adapter.parseTransactions(file);
  }

  static deleteWalletTransactions(transactions: Transaction[], platform: string): Transaction[] {
    // Filtrera bort alla transaktioner från den specifika plattformen
    return transactions.filter(tx => tx.platform.toLowerCase() !== platform.toLowerCase());
  }

  static replaceWalletTransactions(
    existingTransactions: Transaction[], 
    newTransactions: Transaction[], 
    platform: string
  ): Transaction[] {
    // Ta bort gamla transaktioner från plattformen och lägg till de nya
    const filteredTransactions = this.deleteWalletTransactions(existingTransactions, platform);
    return [...filteredTransactions, ...newTransactions];
  }

  private static getAdapter(platform: string, walletName?: string) {
    switch (platform.toLowerCase()) {
      case 'binance_trade_csv':
        return new BinanceTradeAdapter();
      case 'binance':
        return new BinanceCSVAdapter();
      case 'blockchain':
        return new BlockchainCSVAdapter();
      case 'generic':
        if (!walletName) {
          throw new Error('Wallet name is required for generic CSV import');
        }
        return new GenericCSVAdapter(walletName);
      default:
        throw new Error('Unsupported platform');
    }
  }
}

export {}; 