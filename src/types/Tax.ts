export interface TaxTransaction {
  date: Date;
  type: 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'STAKING_REWARD';
  asset: string;
  amount: number;
  price: number;
  priceSEK: number;
  totalValue: number;
  totalValueSEK: number;
  costBasis?: number;
  costBasisSEK?: number;
  gainSEK?: number;
  feesInSEK?: number;
}

export interface TaxSummary {
  capitalGains: {
    realizedGains: number;
    realizedLosses: number;
    proceedsFromSales: number;
    costBasis: number;
    fees: number;
    otherCosts: number;
    netCapitalGains: number;
  };
  income: {
    payments: number;
    rebatesAndRewards: number;
    gifts: number;
    otherIncome: number;
    totalIncome: number;
  };
  settings: {
    taxJurisdiction: string;
    baseCurrency: string;
    costBasisMethod: 'FIFO' | 'LIFO' | 'Average Cost';
    timeZone: string;
    fiscalYear: string;
  };
} 