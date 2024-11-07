import { Transaction, TransactionType } from '../types/Transaction';
import { TaxSummary, TaxTransaction } from '../types/Tax';
import { CurrencyService } from './CurrencyService';

export class TaxService {
  static async calculateTaxSummary(transactions: Transaction[], year: number): Promise<TaxSummary> {
    const yearTransactions = transactions.filter(t => 
      t.date.getFullYear() === year
    );

    const taxTransactions = await this.prepareTaxTransactions(yearTransactions);
    const capitalGains = this.calculateCapitalGains(taxTransactions);
    const income = this.calculateIncome(taxTransactions);

    return {
      capitalGains,
      income,
      settings: {
        taxJurisdiction: 'Sweden',
        baseCurrency: 'SEK',
        costBasisMethod: 'Average Cost',
        timeZone: 'Europe/Stockholm',
        fiscalYear: 'Jan 1 - Dec 31'
      }
    };
  }

  private static async prepareTaxTransactions(transactions: Transaction[]): Promise<TaxTransaction[]> {
    const taxTransactions: TaxTransaction[] = [];
    const assetGroups = new Map<string, Transaction[]>();
    
    // Gruppera transaktioner per tillgång
    transactions.forEach(tx => {
      const current = assetGroups.get(tx.asset) || [];
      assetGroups.set(tx.asset, [...current, tx]);
    });

    for (const [asset, txs] of assetGroups.entries()) {
      let runningCostBasisSEK = 0;
      let runningAmount = 0;

      // Sortera transaktioner efter datum
      const sortedTxs = txs.sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const tx of sortedTxs) {
        if (tx.type === 'BUY') {
          const valueSEK = await this.calculateTransactionValueSEK(
            tx.amount * (tx.price || 0),
            tx.asset,
            tx.date
          );
          runningCostBasisSEK += valueSEK;
          runningAmount += tx.amount;
        }

        const avgCostBasisSEK = runningAmount > 0 ? runningCostBasisSEK / runningAmount : 0;
        const currentValueSEK = await this.calculateTransactionValueSEK(
          tx.amount * (tx.price || 0),
          tx.asset,
          tx.date
        );

        taxTransactions.push({
          date: tx.date,
          type: this.mapTransactionType(tx.type),
          asset: tx.asset,
          amount: tx.amount,
          price: tx.price || 0,
          priceSEK: await CurrencyService.convertToSEK(tx.price || 0, tx.asset, tx.date),
          totalValue: tx.amount * (tx.price || 0),
          totalValueSEK: currentValueSEK,
          costBasisSEK: avgCostBasisSEK,
          gainSEK: tx.type === 'SELL' ? currentValueSEK - (avgCostBasisSEK * tx.amount) : 0,
          feesInSEK: tx.feeAmount ? await this.calculateTransactionValueSEK(
            tx.feeAmount,
            tx.feeCurrency || tx.asset,
            tx.date
          ) : undefined
        });

        if (tx.type === 'SELL') {
          runningAmount = Math.max(0, runningAmount - tx.amount);
          runningCostBasisSEK = runningAmount * avgCostBasisSEK;
        }
      }
    }

    return taxTransactions;
  }

  private static calculateCapitalGains(transactions: TaxTransaction[]) {
    return transactions.reduce((summary, tx) => {
      if (tx.type === 'SELL') {
        const gain = tx.gainSEK || 0;
        if (gain > 0) {
          summary.realizedGains += gain * tx.amount;
        } else {
          summary.realizedLosses += Math.abs(gain) * tx.amount;
        }
        summary.proceedsFromSales += tx.totalValue;
        summary.costBasis += (tx.costBasisSEK || 0) * tx.amount;
      }
      
      if (tx.feesInSEK) {
        summary.fees += tx.feesInSEK;
      }

      summary.netCapitalGains = 
        summary.realizedGains - 
        summary.realizedLosses - 
        summary.fees - 
        summary.otherCosts;

      return summary;
    }, {
      realizedGains: 0,
      realizedLosses: 0,
      proceedsFromSales: 0,
      costBasis: 0,
      fees: 0,
      otherCosts: 0,
      netCapitalGains: 0
    });
  }

  private static calculateIncome(transactions: TaxTransaction[]) {
    return transactions.reduce((summary, tx) => {
      if (tx.type === 'STAKING_REWARD') {
        summary.rebatesAndRewards += tx.totalValue;
      }
      
      summary.totalIncome = 
        summary.payments + 
        summary.rebatesAndRewards + 
        summary.gifts + 
        summary.otherIncome;

      return summary;
    }, {
      payments: 0,
      rebatesAndRewards: 0,
      gifts: 0,
      otherIncome: 0,
      totalIncome: 0
    });
  }

  private static async calculateTransactionValueSEK(
    amount: number, 
    currency: string, 
    date: Date
  ): Promise<number> {
    return CurrencyService.convertToSEK(amount, currency, date);
  }

  private static mapTransactionType(type: TransactionType): 'BUY' | 'SELL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'STAKING_REWARD' {
    switch (type) {
        case 'BUY':
            return 'BUY';
        case 'SELL':
            return 'SELL';
        case 'DEPOSIT':
        case 'TRANSFER_IN':
            return 'TRANSFER_IN';
        case 'WITHDRAWAL':
        case 'TRANSFER_OUT':
            return 'TRANSFER_OUT';
        case 'STAKING_REWARD':
            return 'STAKING_REWARD';
        default:
            // För andra typer, bestäm lämplig mappning
            return 'TRANSFER_IN';
    }
  }
} 