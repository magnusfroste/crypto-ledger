import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import { AssetLedger } from '../types/Ledger';

interface Props {
  ledger: AssetLedger;
  currentPrice?: number;
}

export const AssetSummary: React.FC<Props> = ({ ledger, currentPrice }) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const formatUSD = (num: number) => {
    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculateTotalValue = () => {
    if (!currentPrice) return 0;
    return ledger.currentBalance * currentPrice;
  };

  const calculateUnrealizedPL = () => {
    if (!currentPrice || !ledger.averageCost) return 0;
    return (currentPrice - ledger.averageCost) * ledger.currentBalance;
  };

  const unrealizedPL = calculateUnrealizedPL();
  const totalValue = calculateTotalValue();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {ledger.asset}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Balance
            </Typography>
            <Typography variant="h6">
              {formatNumber(ledger.currentBalance)}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Average Cost Basis
            </Typography>
            <Typography variant="h6">
              {ledger.averageCost ? formatUSD(ledger.averageCost) : '-'}
            </Typography>
          </Box>
        </Grid>

        {currentPrice && (
          <>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Price
                </Typography>
                <Typography variant="h6">
                  {formatUSD(currentPrice)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h6">
                  {formatUSD(totalValue)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Unrealized P/L
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    {formatUSD(unrealizedPL)}
                  </Typography>
                  {unrealizedPL !== 0 && (
                    <Chip
                      size="small"
                      color={unrealizedPL > 0 ? 'success' : 'error'}
                      label={`${((unrealizedPL / (totalValue - unrealizedPL)) * 100).toFixed(2)}%`}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

export {}; 