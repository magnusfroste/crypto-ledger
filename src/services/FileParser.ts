import { Transaction, TransactionType } from '../types/Transaction';

export class FileParser {
  private static mapOperationType(operation: string): TransactionType {
    const operationMap: Record<string, TransactionType> = {
      'Buy': 'BUY',
      'Sell': 'SELL',
      'Deposit': 'TRANSFER_IN',
      'Withdrawal': 'TRANSFER_OUT',
      'Fee': 'FEE',
      'Savings distribution': 'STAKING_REWARD',
      'Simple Earn Flexible Interest': 'STAKING_REWARD',
      'Transaction Related': 'TRANSFER_IN',
      'Trade': 'SWAP'
    };
    return operationMap[operation] || 'TRANSFER_IN';
  }

  private static parseNumber(value: string): number | undefined {
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? undefined : parsed;
  }

  static async parseBinanceTransactionHistory(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const transactions: Transaction[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            if (columns.length < 6) continue;

            const [userId, utcTime, account, operation, coin, change] = columns;
            
            const date = new Date(utcTime);
            if (isNaN(date.getTime())) continue;

            const parsedAmount = this.parseNumber(change);
            if (parsedAmount === undefined) continue;

            const tradeIdMatch = operation.match(/Trade (\d+)/);
            const tradeId = tradeIdMatch ? tradeIdMatch[1] : undefined;

            transactions.push({
              id: `binance-${userId}-${i}`,
              date,
              type: this.mapOperationType(operation.split(' ')[0]),
              asset: coin,
              amount: Math.abs(parsedAmount),
              platform: 'Binance',
              notes: operation,
              tradeId
            });
          }
          
          resolve(transactions);
        } catch (error) {
          console.error('Transaction parsing error:', error);
          reject(new Error('Kunde inte tolka CSV-filen. Kontrollera formatet.'));
        }
      };
      
      reader.onerror = () => reject(new Error('Kunde inte läsa filen'));
      reader.readAsText(file);
    });
  }
}

export {}; 