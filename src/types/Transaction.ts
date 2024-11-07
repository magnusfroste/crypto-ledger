export type TransactionType = 
  | 'DEPOSIT'              // Insättningar
  | 'WITHDRAWAL'           // Uttag
  | 'BUY'                 // Köp
  | 'SELL'                // Sälj
  | 'TRADE'               // Generisk trade
  | 'TRADE_FIAT_CRYPTO'   // Trade: Fiat → Crypto
  | 'TRADE_CRYPTO_FIAT'   // Trade: Crypto → Fiat
  | 'TRADE_CRYPTO_CRYPTO' // Trade: Crypto → Crypto
  | 'TRANSFER_IN'         // Överföring in
  | 'TRANSFER_OUT'        // Överföring ut
  | 'SWAP'                // Direkt byte mellan cryptos
  | 'STAKING_REWARD'      // Staking belöningar
  | 'FEE'                 // Avgifter
  | 'AIRDROP'            // Airdrops
  | 'MINING';            // Mining rewards

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  asset: string;
  amount: number;
  price?: number;
  totalValue?: number;
  
  // Fee information
  feeAmount?: number;
  feeCurrency?: string;
  
  // Swap/Trade details
  sentAmount?: number;
  sentCurrency?: string;
  receivedAmount?: number;
  receivedCurrency?: string;
  
  // Additional information
  netWorthAmount?: number;
  netWorthCurrency?: string;
  platform: string;
  description?: string;
  label?: string;
  notes?: string;
  txHash?: string;
  tradeId?: string;
}

export interface Holding {
  asset: string;
  amount: number;
  value: number;
  change24h: number;
}

export interface Wallet {
  id: string;
  platform: string;
  transactionCount: number;
  lastUpdated: Date;
  assets: {
    symbol: string;
    balance: number;
  }[];
}

export interface TaxCalculation {
  year: number;
  asset: string;
  totalProceeds: number;
  totalCostBasis: number;
  realizedGain: number;
  taxableAmount: number;
}

export interface MarketPrice {
  asset: string;
  price: number;
  lastUpdated: Date;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalValue: number;
  byAsset: {
    [key: string]: {
      totalAmount: number;
      averagePrice?: number;
      totalValue?: number;
    }
  };
  byType: {
    [key in TransactionType]?: number;
  };
}

// Helper för att mappa externa transaktionstyper till våra interna
export const mapTransactionType = (
  externalType: string, 
  fromAsset?: string, 
  toAsset?: string
): TransactionType => {
  const isFiat = (asset?: string) => 
    asset ? ['USD', 'EUR', 'SEK'].includes(asset.toUpperCase()) : false;

  // Hantera trades
  if (externalType.toUpperCase().includes('TRADE') || 
      externalType.toUpperCase().includes('SWAP')) {
    if (fromAsset && toAsset) {
      if (isFiat(fromAsset)) return 'TRADE_FIAT_CRYPTO';
      if (isFiat(toAsset)) return 'TRADE_CRYPTO_FIAT';
      return 'TRADE_CRYPTO_CRYPTO';
    }
    return 'TRADE';
  }

  // Mappa andra typer
  const typeMap: Record<string, TransactionType> = {
    'BUY': 'BUY',
    'SELL': 'SELL',
    'DEPOSIT': 'DEPOSIT',
    'WITHDRAWAL': 'WITHDRAWAL',
    'TRANSFER_IN': 'TRANSFER_IN',
    'TRANSFER_OUT': 'TRANSFER_OUT',
    'STAKING_REWARD': 'STAKING_REWARD',
    'FEE': 'FEE',
    'AIRDROP': 'AIRDROP',
    'MINING': 'MINING',
    'RECEIVE': 'TRANSFER_IN',
    'SEND': 'TRANSFER_OUT'
  };

  return typeMap[externalType.toUpperCase()] || 'TRANSFER_IN';
};

export {}; 