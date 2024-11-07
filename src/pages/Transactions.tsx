import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid
} from '@mui/material';
import { useTransactionContext } from '../contexts/TransactionContext';
import { TransactionList } from '../components/TransactionList';
import { useSearchParams } from 'react-router-dom';
import { TransactionType } from '../types/Transaction';

const transactionTypeLabels: Record<TransactionType, string> = {
  'DEPOSIT': 'Deposit',
  'WITHDRAWAL': 'Withdrawal',
  'BUY': 'Buy',
  'SELL': 'Sell',
  'TRADE': 'Trade',
  'TRADE_FIAT_CRYPTO': 'Trade: Fiat → Crypto',
  'TRADE_CRYPTO_FIAT': 'Trade: Crypto → Fiat',
  'TRADE_CRYPTO_CRYPTO': 'Trade: Crypto → Crypto',
  'TRANSFER_IN': 'Transfer In',
  'TRANSFER_OUT': 'Transfer Out',
  'SWAP': 'Swap',
  'STAKING_REWARD': 'Staking Reward',
  'FEE': 'Fee',
  'AIRDROP': 'Airdrop',
  'MINING': 'Mining'
};

export const Transactions: React.FC = () => {
  const { transactions, wallets } = useTransactionContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Find the wallet based on the URL parameter
  const urlWalletId = searchParams.get('wallet_id');
  const matchedWallet = urlWalletId 
    ? wallets.find(w => w.id === urlWalletId)
    : null;

  // Set initial selected wallet based on URL or 'all'
  const [selectedWallet, setSelectedWallet] = useState<string>(
    matchedWallet ? matchedWallet.platform : 'all'
  );

  // Update selected wallet when URL changes
  useEffect(() => {
    if (urlWalletId) {
      const wallet = wallets.find(w => w.id === urlWalletId);
      if (wallet) {
        setSelectedWallet(wallet.platform);
      }
    }
  }, [urlWalletId, wallets]);

  // Handle wallet selection change
  const handleWalletChange = (value: string) => {
    setSelectedWallet(value);
    if (value === 'all') {
      searchParams.delete('wallet_id');
    } else {
      const wallet = wallets.find(w => w.platform === value);
      if (wallet) {
        searchParams.set('wallet_id', wallet.id);
      }
    }
    setSearchParams(searchParams);
  };

  // Add advanced filtering
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    minAmount: '',
    maxAmount: '',
    assets: [] as string[],
    types: [] as string[]
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (filters.dateFrom && tx.date < filters.dateFrom) return false;
      if (filters.dateTo && tx.date > filters.dateTo) return false;
      if (filters.minAmount && tx.amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && tx.amount > parseFloat(filters.maxAmount)) return false;
      if (filters.assets.length && !filters.assets.includes(tx.asset)) return false;
      if (filters.types.length && !filters.types.includes(tx.type)) return false;
      return true;
    });
  }, [transactions, filters]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Wallet</InputLabel>
              <Select
                value={selectedWallet}
                label="Wallet"
                onChange={(e) => handleWalletChange(e.target.value)}
              >
                <MenuItem value="all">All wallets</MenuItem>
                {wallets.map((wallet) => (
                  <MenuItem key={wallet.id} value={wallet.platform}>
                    {wallet.platform} ({wallet.transactionCount})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="all">All types</MenuItem>
                <MenuItem value="trades">Trades (Buy/Sell)</MenuItem>
                <MenuItem value="transfers">Transfers & Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset, type, platform..."
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTransactions.length} of {transactions.length} transactions
          {selectedWallet !== 'all' && ` from ${selectedWallet}`}
        </Typography>
      </Box>

      <TransactionList transactions={filteredTransactions} />
    </Box>
  );
};

export {};