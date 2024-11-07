import React, { useState } from 'react';
import { Button, Alert, CircularProgress } from '@mui/material';
import { Transaction } from '../types/Transaction';
import { WalletService } from '../services/WalletService';

interface Props {
  onTransactionsLoaded: (transactions: Transaction[], type: 'trade' | 'transaction') => void;
}

export const FileUpload: React.FC<Props> = ({ onTransactionsLoaded }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'trade' | 'transaction') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const transactions = await WalletService.parseCSV(
        file, 
        type === 'trade' ? 'binance_trade_csv' : 'binance'
      );
      onTransactionsLoaded(transactions, type);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during file upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        component="label"
        disabled={loading}
        sx={{ mr: 2 }}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Loading...' : 'Upload Trade History'}
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={(e) => handleFileUpload(e, 'trade')}
        />
      </Button>

      <Button
        variant="contained"
        component="label"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Loading...' : 'Upload Transaction History'}
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={(e) => handleFileUpload(e, 'transaction')}
        />
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export {}; 