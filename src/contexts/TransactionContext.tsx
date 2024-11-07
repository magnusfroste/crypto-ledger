import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Holding, Wallet } from '../types/Transaction';
import { PriceService } from '../services/PriceService';
import { LedgerService } from '../services/LedgerService';

interface TransactionContextType {
  transactions: Transaction[];
  holdings: Holding[];
  wallets: Wallet[];
  totalValue: number;
  performance24h: number;
  addTransactions: (newTransactions: Transaction[]) => void;
  removeWallet: (walletId: string) => void;
  prices: Map<string, { price: number, change24h: number }>;
  ledgerService: LedgerService;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [performance24h, setPerformance24h] = useState(0);
  const [prices, setPrices] = useState<Map<string, { price: number, change24h: number }>>(new Map());
  const [ledgerService] = useState(() => new LedgerService());

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const assets = Array.from(new Set(transactions.map(t => t.asset)));
        const newPrices = await PriceService.getPrices(assets);
        setPrices(newPrices);
        calculateHoldings(newPrices);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [transactions]);

  const calculateHoldings = (currentPrices: Map<string, { price: number, change24h: number }>) => {
    const holdingsMap = new Map<string, number>();

    transactions.forEach(transaction => {
      const currentBalance = holdingsMap.get(transaction.asset) || 0;
      
      switch (transaction.type) {
        case 'BUY':
        case 'TRANSFER_IN':
        case 'STAKING_REWARD':
        case 'AIRDROP':
        case 'MINING':
          holdingsMap.set(transaction.asset, currentBalance + transaction.amount);
          break;
        case 'SELL':
        case 'TRANSFER_OUT':
        case 'FEE':
          holdingsMap.set(transaction.asset, currentBalance - transaction.amount);
          break;
      }
    });

    const newHoldings: Holding[] = Array.from(holdingsMap.entries())
      .filter(([_, balance]) => balance > 0)
      .map(([asset, amount]) => {
        const priceData = currentPrices.get(asset);
        return {
          asset,
          amount,
          value: amount * (priceData?.price || 0),
          change24h: priceData?.change24h || 0
        };
      })
      .sort((a, b) => b.value - a.value);

    setHoldings(newHoldings);
    
    const newTotalValue = newHoldings.reduce((sum, h) => sum + h.value, 0);
    setTotalValue(newTotalValue);

    const weightedChange = newHoldings.reduce((sum, h) => {
      return sum + (h.change24h * (h.value / newTotalValue));
    }, 0);
    setPerformance24h(weightedChange);
  };

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => {
      const updated = [...prev, ...newTransactions];
      
      // Process all transactions in chronological order
      const sorted = updated.sort((a, b) => a.date.getTime() - b.date.getTime());
      sorted.forEach(tx => ledgerService.processTransaction(tx));
      
      return updated;
    });
    
    const platform = newTransactions[0]?.platform;
    if (platform) {
      const walletId = `${platform}-${Date.now()}`;
      const assets = calculateWalletAssets(newTransactions);
      
      setWallets(prev => [...prev, {
        id: walletId,
        platform,
        transactionCount: newTransactions.length,
        lastUpdated: new Date(),
        assets
      }]);
    }
  };

  const removeWallet = (walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
  };

  const calculateWalletAssets = (walletTransactions: Transaction[]) => {
    return [];
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      holdings,
      wallets,
      totalValue,
      performance24h,
      addTransactions,
      removeWallet,
      prices,
      ledgerService
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
}; 