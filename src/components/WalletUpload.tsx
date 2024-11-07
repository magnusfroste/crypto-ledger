import React, { useState } from 'react';
import { 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  CircularProgress,
  Alert,
  TextField 
} from '@mui/material';
import { WalletService } from '../services/WalletService';
import { Transaction } from '../types/Transaction';

interface Props {
  onTransactionsLoaded: (transactions: Transaction[]) => void;
  existingTransactions: Transaction[];
}

export const WalletUpload: React.FC<Props> = ({ onTransactionsLoaded, existingTransactions }) => {
  const [platform, setPlatform] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !platform) return;
    if (platform === 'generic' && !walletName) {
      setError('Wallet name is required for generic CSV import');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newTransactions = await WalletService.parseCSV(file, platform, walletName);
      
      if (newTransactions.length === 0) {
        throw new Error('No transactions found in file');
      }

      // Ersätt gamla transaktioner från samma plattform med de nya
      const updatedTransactions = WalletService.replaceWalletTransactions(
        existingTransactions,
        newTransactions,
        platform
      );

      onTransactionsLoaded(updatedTransactions);
      setSuccess(true);
      
      // Reset form
      setPlatform('');
      setWalletName('');
      event.target.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during file upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Platform</InputLabel>
        <Select
          value={platform}
          label="Platform"
          onChange={(e) => setPlatform(e.target.value)}
        >
          <MenuItem value="binance_trade_csv">Binance Trade CSV</MenuItem>
          <MenuItem value="binance">Binance Transaction History</MenuItem>
          <MenuItem value="blockchain">Blockchain.com</MenuItem>
          <MenuItem value="generic">Generic CSV</MenuItem>
        </Select>
      </FormControl>

      {platform === 'generic' && (
        <TextField
          fullWidth
          label="Wallet Name"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          required
        />
      )}

      <Button
        variant="contained"
        component="label"
        disabled={!platform || loading}
        fullWidth
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Loading...' : 'Upload CSV'}
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={handleFileUpload}
        />
      </Button>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success">
          Transactions uploaded successfully
        </Alert>
      )}
    </Box>
  );
}; 