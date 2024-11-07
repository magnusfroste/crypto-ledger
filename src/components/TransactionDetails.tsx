import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Transaction } from '../types/Transaction';

interface Props {
  transaction: Transaction;
}

export const TransactionDetails: React.FC<Props> = ({ transaction }) => {
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '-';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrencyValue = (amount?: number, currency?: string) => {
    if (!amount || !currency) return '-';
    return `${formatNumber(amount)} ${currency}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Basic Information
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Date: {formatDate(transaction.date)}
              </Typography>
              <Typography variant="body2">
                Type: {transaction.type}
              </Typography>
              <Typography variant="body2">
                Platform: {transaction.platform}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Transaction Details
            </Typography>
            <Box sx={{ mt: 1 }}>
              {transaction.sentAmount && (
                <Typography variant="body2">
                  Sent: {formatCurrencyValue(transaction.sentAmount, transaction.sentCurrency)}
                </Typography>
              )}
              {transaction.receivedAmount && (
                <Typography variant="body2">
                  Received: {formatCurrencyValue(transaction.receivedAmount, transaction.receivedCurrency)}
                </Typography>
              )}
              {transaction.feeAmount && (
                <Typography variant="body2">
                  Fee: {formatCurrencyValue(transaction.feeAmount, transaction.feeCurrency)}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {transaction.netWorthAmount && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Value Information
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Net Worth: {formatCurrencyValue(transaction.netWorthAmount, transaction.netWorthCurrency)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {(transaction.description || transaction.label || transaction.txHash) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Additional Information
              </Typography>
              <Box sx={{ mt: 1 }}>
                {transaction.label && (
                  <Typography variant="body2">
                    Label: {transaction.label}
                  </Typography>
                )}
                {transaction.description && (
                  <Typography variant="body2">
                    Description: {transaction.description}
                  </Typography>
                )}
                {transaction.txHash && (
                  <Typography variant="body2">
                    Transaction Hash: {transaction.txHash}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export {}; 