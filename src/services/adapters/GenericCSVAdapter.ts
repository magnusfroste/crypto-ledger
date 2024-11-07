import { WalletAdapter } from './WalletAdapter';
import { Transaction, TransactionType } from '../../types/Transaction';

interface ColumnIndices {
  [key: string]: number;
}

export class GenericCSVAdapter implements WalletAdapter {
  private readonly EXPECTED_COLUMNS = [
    'date', 'sent_amount', 'sent_currency', 'received_amount',
    'received_currency', 'fee_amount', 'fee_currency',
    'net_worth_amount', 'net_worth_currency', 'label',
    'description', 'txhash'
  ];

  constructor(private readonly walletName: string) {}

  getName(): string {
    return this.walletName;
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
          console.log('Processing Generic CSV file');
          
          const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          console.log('Lines read from file:', lines);

          if (lines.length < 2) {
            throw new Error('File appears to be empty or contains only headers');
          }

          const columnIndices = this.parseHeaders(lines[0]);
          const transactions: Transaction[] = [];

          for (let i = 1; i < lines.length; i++) {
            try {
              const transaction = this.parseLine(lines[i], columnIndices);
              if (transaction) {
                transactions.push(transaction);
              }
            } catch (error) {
              console.warn(`Failed to parse line ${i}:`, error);
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

  private parseHeaders(headerLine: string): ColumnIndices {
    const headers = headerLine.toLowerCase().split(',').map(h => h.trim());
    const indices: ColumnIndices = {};
    
    console.log('Headers:', headers);
    
    // Mappning mellan möjliga kolumnnamn och förväntade kolumnnamn
    const columnMappings: { [key: string]: string[] } = {
        'date': ['date', 'time', 'timestamp', 'datum', 'tid'],
        'sent_amount': ['sent amount', 'sent', 'debit', 'utgående belopp', 'sent_amount'],
        'sent_currency': ['sent currency', 'debit currency', 'utgående valuta', 'sent_currency'],
        'received_amount': ['received amount', 'received', 'credit', 'inkommande belopp', 'received_amount'],
        'received_currency': ['received currency', 'credit currency', 'inkommande valuta', 'received_currency'],
        'fee_amount': ['fee amount', 'fee', 'avgift', 'fee_amount'],
        'fee_currency': ['fee currency', 'avgift valuta', 'fee_currency'],
        'net_worth_amount': ['net worth amount', 'net worth', 'värde', 'net_worth_amount'],
        'net_worth_currency': ['net worth currency', 'värde valuta', 'net_worth_currency'],
        'label': ['label', 'type', 'typ', 'kategori'],
        'description': ['description', 'notes', 'comment', 'beskrivning', 'kommentar'],
        'txhash': ['txhash', 'transaction id', 'hash', 'tx hash', 'transaction hash']
    };

    this.EXPECTED_COLUMNS.forEach(expectedColumn => {
        const possibleNames = columnMappings[expectedColumn] || [expectedColumn];
        const index = headers.findIndex(h => 
            possibleNames.some(name => h.includes(name))
        );
        
        if (index !== -1) {
            indices[expectedColumn] = index;
            console.log(`Mapped ${headers[index]} to ${expectedColumn} at index ${index}`);
        }
    });

    console.log('Column indices:', indices);
    return indices;
  }

  private parseLine(line: string, columnIndices: ColumnIndices): Transaction | null {
    const columns = line.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'));
    
    console.log('Original columns:', columns);
    console.log('Column indices:', columnIndices);

    const getValue = (columnName: string): string => {
        const index = columnIndices[columnName];
        if (index === undefined) {
            console.log(`Missing index for column: ${columnName}`);
            return '';
        }
        
        let value = columns[index] || '';
        console.log(`Getting value for ${columnName} at index ${index}: ${value}`);
        
        if (value.includes(',') && !value.includes('.')) {
            const nextValue = columns.splice(index + 1, 1)[0];
            value = value + (nextValue || '');
            Object.keys(columnIndices).forEach(key => {
                if (columnIndices[key] > index) {
                    columnIndices[key]--;
                }
            });
            console.log(`Combined value for ${columnName}: ${value}`);
        }
        return value.trim();
    };

    console.log('Processing columns:', columns);

    const dateStr = getValue('date');
    let date: Date;
    
    try {
        const cleanDateStr = dateStr
            .replace(' CEST', '')
            .replace(' UTC', '')
            .replace(' CET', '');
            
        date = new Date(cleanDateStr);
        
        if (isNaN(date.getTime())) {
            const [datePart, timePart] = cleanDateStr.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute] = timePart.split(':').map(Number);
            
            date = new Date(year, month - 1, day, hour, minute);
        }
        
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date: ${dateStr}`);
            return null;
        }
    } catch (error) {
        console.warn(`Failed to parse date: ${dateStr}`, error);
        return null;
    }

    // Hantera belopp
    const sentAmountStr = getValue('sent_amount');
    const receivedAmountStr = getValue('received_amount');
    const sentAmount = parseFloat(sentAmountStr.replace(',', '.'));
    const receivedAmount = parseFloat(receivedAmountStr.replace(',', '.'));
    
    // Minst ett belopp måste vara giltigt
    if (isNaN(sentAmount) && isNaN(receivedAmount)) {
        console.warn(`Both sent and received amounts are invalid: sent=${sentAmountStr}, received=${receivedAmountStr}`);
        return null;
    }

    const transaction: Transaction = {
        id: `${this.walletName}-${date.getTime()}-${getValue('sent_currency') || getValue('received_currency')}`,
        date,
        type: this.determineTransactionType(sentAmount, receivedAmount),
        asset: getValue('sent_currency') || getValue('received_currency'),
        amount: Math.abs(sentAmount || receivedAmount),
        platform: this.walletName,
        description: getValue('description'),
        label: getValue('label'),
        txHash: getValue('txhash'),
        
        // Optional fields
        sentAmount: !isNaN(sentAmount) ? sentAmount : undefined,
        sentCurrency: getValue('sent_currency') || undefined,
        receivedAmount: !isNaN(receivedAmount) ? receivedAmount : undefined,
        receivedCurrency: getValue('received_currency') || undefined,
        feeAmount: parseFloat(getValue('fee_amount').replace(',', '.')) || undefined,
        feeCurrency: getValue('fee_currency') || undefined,
        netWorthAmount: parseFloat(getValue('net_worth_amount').replace(',', '.')) || undefined,
        netWorthCurrency: getValue('net_worth_currency') || undefined
    };

    console.log('Parsed transaction:', transaction);
    return transaction;
  }

  private determineTransactionType(sentAmount: number, receivedAmount: number): TransactionType {
    if (!isNaN(sentAmount) && !isNaN(receivedAmount)) {
      return 'TRADE_CRYPTO_CRYPTO';
    } else if (!isNaN(sentAmount)) {
      return 'TRANSFER_OUT';
    } else if (!isNaN(receivedAmount)) {
      return 'TRANSFER_IN';
    }
    return 'TRANSFER_IN'; // Default case
  }
}

export {}; 