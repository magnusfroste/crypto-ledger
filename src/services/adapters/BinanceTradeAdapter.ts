import { WalletAdapter } from './WalletAdapter';
import { Transaction, TransactionType } from '../../types/Transaction';

export class BinanceTradeAdapter implements WalletAdapter {
  getName(): string {
    return 'Binance Trade';
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
          console.log('Starting to parse Binance Trade CSV');
          
          const cleanText = text.replace(/^\uFEFF/, '');
          const lines = cleanText.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          console.log('Total lines:', lines.length);
          console.log('Header:', lines[0]);
          console.log('First data line:', lines[1]);
          
          const transactions = this.parseTradeHistory(lines);
          
          if (transactions.length === 0) {
            console.error('No transactions were parsed successfully');
            throw new Error('No valid trades found in file');
          }

          console.log(`Successfully parsed ${transactions.length} trades`);
          resolve(transactions);
        } catch (error) {
          console.error('Parse error:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  private parseTradeHistory(lines: string[]): Transaction[] {
    const transactions: Transaction[] = [];
    
    const expectedHeader = 'Date(UTC),OrderNo,Pair,Type,Side,Order Price,Order Amount,Time,Executed,Average Price,Trading total,Status';
    const header = lines[0];
    
    if (!header.includes('Date') || !header.includes('OrderNo')) {
        console.error('Invalid file format. Expected Binance Trade history format.');
        console.error('Expected:', expectedHeader);
        console.error('Got:', header);
        return [];
    }
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const line = lines[i];
            if (!line.trim()) continue;
            
            console.log(`Processing line ${i}:`, line);
            
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            if (columns.length < 12) {
                console.warn(`Skipping line ${i}: insufficient columns`);
                continue;
            }
            
            const [dateStr, orderNo, pair, type, side, orderPrice, orderAmount, 
                  time, executed, avgPrice, total, status] = columns;

            console.log('Parsed values:', {
                dateStr, orderNo, pair, type, side, 
                orderPrice, orderAmount, executed, avgPrice, total, status
            });

            if (status === 'CANCELED') {
                console.log('Skipping canceled order');
                continue;
            }

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                console.log('Invalid date:', dateStr);
                continue;
            }

            const amountMatch = executed.match(/^([\d,.]+)/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : NaN;
            
            const priceMatch = avgPrice.match(/^([\d,.]+)/);
            const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : NaN;
            
            const totalMatch = total.match(/^([\d,.]+)/);
            const totalValue = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : NaN;

            console.log('Parsed numeric values:', { amount, price, totalValue });

            if (isNaN(amount) || isNaN(price)) {
                console.log('Invalid amount or price:', executed, avgPrice);
                continue;
            }

            const [baseAsset, quoteAsset] = this.splitTradingPair(pair);
            console.log('Split trading pair:', { baseAsset, quoteAsset });

            const transaction: Transaction = {
                id: `binance-trade-${date.getTime()}-${orderNo}`,
                date,
                type: side === 'BUY' ? 'BUY' : 'SELL',
                asset: baseAsset,
                amount,
                price,
                totalValue,
                platform: 'Binance',
                description: `${side} ${pair} @ ${price} ${quoteAsset}`,
                notes: `Trade on Binance: ${side} ${amount} ${baseAsset} at ${price} ${quoteAsset}`
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
    
    const mid = Math.ceil(market.length / 2);
    return [market.slice(0, mid), market.slice(mid)];
  }
}

export {}; 