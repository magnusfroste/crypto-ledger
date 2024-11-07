import React from 'react';
import { Box, Typography } from '@mui/material';
import { LedgerView } from '../components/LedgerView';
import { useTransactionContext } from '../contexts/TransactionContext';
import { useSearchParams } from 'react-router-dom';

export const Ledger: React.FC = () => {
  const { ledgerService } = useTransactionContext();
  const [searchParams] = useSearchParams();
  const selectedAsset = searchParams.get('asset');
  const ledgers = ledgerService.getAllLedgers();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Asset Ledgers
      </Typography>
      <LedgerView 
        ledgers={ledgers} 
        defaultAsset={selectedAsset || undefined}
      />
    </Box>
  );
}; 