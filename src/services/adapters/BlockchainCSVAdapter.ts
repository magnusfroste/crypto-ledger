import { WalletAdapter } from './WalletAdapter';
import { Transaction, TransactionType } from '../../types/Transaction';

export class BlockchainCSVAdapter implements WalletAdapter {
  getName(): string {
    return 'Blockchain.com';
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
          console.log('Processing Blockchain CSV:', text.substring(0, 200));
          
          const lines = text
            .split('\n')
            .map(line => line.replace('\r', '').trim())
            .filter(line => line.length > 0);
          
          console.log('Number of lines:', lines.length);
          const transactions: Transaction[] = [];
          
          // Skip header
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const columns = this.parseCSVLine(line);
            
            const [
              dateTimeUtc,
              transactionType,
              asset,
              quantityTransacted,
              counterAsset,
              counterAmount,
              feeAsset,
              feeAmount,
              notes,
              transactionId,
              transactionHash
            ] = columns;

            if (!this.validateFields(dateTimeUtc, transactionType, asset, quantityTransacted)) {
              continue;
            }

            const transaction = this.createTransaction(
              dateTimeUtc,
              transactionType,
              asset,
              quantityTransacted,
              counterAsset,
              counterAmount,
              feeAsset,
              feeAmount,
              notes,
              transactionId,
              transactionHash
            );

            if (transaction) {
              transactions.push(transaction);
            }
          }

          if (transactions.length === 0) {
            throw new Error('No valid transactions found in file');
          }

          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private validateFields(date: string, type: string, asset: string, amount: string): boolean {
    return !!(date && type && asset && amount);
  }

  private createTransaction(
    dateTimeUtc: string,
    transactionType: string,
    asset: string,
    quantityTransacted: string,
    counterAsset: string,
    counterAmount: string,
    feeAsset: string,
    feeAmount: string,
    notes: string,
    transactionId: string,
    transactionHash: string
  ): Transaction | null {
    const date = new Date(dateTimeUtc);
    if (isNaN(date.getTime())) return null;

    const amount = parseFloat(quantityTransacted);
    if (isNaN(amount)) return null;

    return {
      id: transactionId || `blockchain-${date.getTime()}-${asset}-${amount}`,
      date,
      type: this.mapTransactionType(transactionType),
      asset,
      amount: Math.abs(amount),
      platform: 'Blockchain.com',
      description: notes || undefined,
      tradeId: transactionId || undefined,
      txHash: transactionHash || undefined,
      feeAmount: feeAmount ? parseFloat(feeAmount) : undefined,
      feeCurrency: feeAsset || undefined
    };
  }

  private mapTransactionType(type: string): TransactionType {
    switch (type.toUpperCase()) {
      case 'REWARDS':
        return 'STAKING_REWARD';
      case 'RECEIVE':
        return 'TRANSFER_IN';
      case 'SEND':
        return 'TRANSFER_OUT';
      case 'SWAP':
        return 'SWAP';
      default:
        console.warn(`Unknown transaction type: ${type}, defaulting to TRANSFER_IN`);
        return 'TRANSFER_IN';
    }
  }
}

export {};