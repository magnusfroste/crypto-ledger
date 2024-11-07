import { WalletAdapter } from './WalletAdapter';
import { Transaction, TransactionType } from '../../types/Transaction';

export class BinanceCSVAdapter implements WalletAdapter {
  getName(): string {
    return 'Binance';
  }

  getType(): 'csv' | 'api' {
    return 'csv';
  }

  async parseTransactions(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          console.log('Starting to parse Binance CSV file');
          
          const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          console.log('First line:', lines[0]);
          const headers = lines[0].toLowerCase();

          let transactions: Transaction[] = [];
          
          // Check for different Binance CSV formats
          if (headers.includes('market') && headers.includes('type') && headers.includes('price')) {
            console.log('Detected: Binance Trade History format');
            transactions = this.parseTradeHistory(lines);
          } else if (headers.includes('utc_time') && headers.includes('operation')) {
            console.log('Detected: Binance Transaction History format');
            transactions = this.parseTransactionHistory(lines);
          } else {
            console.log('Unknown headers:', headers);
            throw new Error('Unrecognized Binance CSV format');
          }

          if (transactions.length === 0) {
            throw new Error('No valid transactions found in file');
          }

          console.log(`Successfully parsed ${transactions.length} transactions`);
          resolve(transactions);
        } catch (error) {
          console.error('Parse error:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseTradeHistory(lines: string[]): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        console.log(`Processing trade line ${i}:`, line);
        
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        // Date,Market,Type,Price,Amount,Total,Fee,Fee Coin
        const [dateStr, market, type, price, amount, total, fee, feeCoin] = columns;

        if (!dateStr || !market || !amount) {
          console.log('Skipping invalid line - missing required fields');
          continue;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.log('Invalid date:', dateStr);
          continue;
        }

        const [baseAsset, quoteAsset] = this.splitTradingPair(market);
        const parsedAmount = parseFloat(amount);
        const parsedPrice = parseFloat(price);
        const parsedFee = fee ? parseFloat(fee) : undefined;

        if (isNaN(parsedAmount) || isNaN(parsedPrice)) {
          console.log('Invalid amount or price:', amount, price);
          continue;
        }

        const transaction: Transaction = {
          id: `binance-trade-${date.getTime()}-${baseAsset}`,
          date,
          type: type.toLowerCase().includes('buy') ? 'BUY' : 'SELL',
          asset: baseAsset,
          amount: parsedAmount,
          price: parsedPrice,
          totalValue: parsedAmount * parsedPrice,
          feeAmount: parsedFee,
          feeCurrency: feeCoin,
          platform: 'Binance',
          description: `${type} ${market}`,
          notes: `Trade on Binance: ${type} ${parsedAmount} ${baseAsset} at ${parsedPrice} ${quoteAsset}`
        };

        console.log('Created transaction:', transaction);
        transactions.push(transaction);
      } catch (error) {
        console.error(`Error processing line ${i}:`, error);
      }
    }

    return transactions;
  }

  private splitTradingPair(market: string): [string, string] {
    const commonQuoteAssets = ['USDT', 'BTC', 'ETH', 'BNB', 'EUR', 'BUSD'];
    
    for (const quote of commonQuoteAssets) {
      if (market.endsWith(quote)) {
        const base = market.slice(0, -quote.length);
        return [base, quote];
      }
    }
    
    // Fallback: split in middle
    const mid = Math.ceil(market.length / 2);
    return [market.slice(0, mid), market.slice(mid)];
  }

  private parseTransactionHistory(lines: string[]): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        console.log(`Processing line ${i}:`, line);
        
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        // Expected format: User_ID,UTC_Time,Account,Operation,Coin,Change,Remark
        const [userId, utcTime, account, operation, coin, change, remark] = columns;
        
        if (!utcTime || !operation || !coin || !change) {
          console.log('Skipping invalid line - missing required fields');
          continue;
        }

        const date = new Date(utcTime);
        if (isNaN(date.getTime())) {
          console.log('Invalid date:', utcTime);
          continue;
        }

        const amount = Math.abs(parseFloat(change.replace(/,/g, '')));
        if (isNaN(amount)) {
          console.log('Invalid amount:', change);
          continue;
        }

        const type = this.mapOperationType(operation);
        const transaction: Transaction = {
          id: `binance-${date.getTime()}-${coin}-${amount}`,
          date,
          type,
          asset: coin,
          amount,
          platform: 'Binance',
          description: `${operation} ${account ? `(${account})` : ''} ${remark || ''}`.trim(),
          notes: operation,
          // Extract transaction hash if present in remark
          txHash: remark?.match(/(?:txId|hash|txHash):\s*([a-fA-F0-9]+)/)?.[1]
        };

        console.log('Created transaction:', transaction);
        transactions.push(transaction);
      } catch (error) {
        console.error(`Error processing line ${i}:`, error);
      }
    }

    return transactions;
  }

  private mapOperationType(operation: string): TransactionType {
    const operationMap: Record<string, TransactionType> = {
      'Deposit': 'DEPOSIT',
      'Withdrawal': 'WITHDRAWAL',
      'Buy': 'BUY',
      'Sell': 'SELL',
      'Fee': 'FEE',
      'Distribution': 'STAKING_REWARD',
      'Savings distribution': 'STAKING_REWARD',
      'Simple Earn Flexible Interest': 'STAKING_REWARD',
      'Commission History': 'FEE',
      'Commission Rebate': 'DEPOSIT',
      'Small Assets Exchange': 'TRADE',
      'Convert Dust': 'TRADE',
      'Transaction Related': 'TRANSFER_IN'
    };

    const type = operationMap[operation];
    if (!type) {
      console.warn(`Unknown operation type: ${operation}, defaulting to TRANSFER_IN`);
      return 'TRANSFER_IN';
    }
    return type;
  }
}

export {};