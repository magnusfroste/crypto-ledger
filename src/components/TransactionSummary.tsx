import React from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Box 
} from '@mui/material';
import { Transaction, TransactionSummary } from '../types/Transaction';

interface Props {
  transactions: Transaction[];
}

export const TransactionSummaryView: React.FC<Props> = ({ transactions }) => {
  const calculateSummary = (): TransactionSummary => {
    const summary: TransactionSummary = {
      totalTransactions: transactions.length,
      totalValue: 0,
      byAsset: {},
      byType: {}
    };

    transactions.forEach(t => {
      // Summera per tillgång
      if (!summary.byAsset[t.asset]) {
        summary.byAsset[t.asset] = {
          totalAmount: 0,
          totalValue: 0,
          averagePrice: 0
        };
      }

      // För köp och överföringar IN
      if (t.type === 'BUY' || 
          t.type === 'TRANSFER_IN' || 
          t.type === 'STAKING_REWARD') {
        summary.byAsset[t.asset].totalAmount += t.amount;
      }
      // För sälj och överföringar UT
      else if (t.type === 'SELL' || 
               t.type === 'TRANSFER_OUT' || 
               t.type === 'FEE') {
        summary.byAsset[t.asset].totalAmount -= t.amount;
      }

      if (t.price && t.amount) {
        const value = t.price * t.amount;
        summary.byAsset[t.asset].totalValue! += value;
        summary.totalValue += value;
      }

      // Summera per typ
      summary.byType[t.type] = (summary.byType[t.type] || 0) + 1;
    });

    // Ta bort tillgångar med 0 i totalAmount
    Object.keys(summary.byAsset).forEach(asset => {
      if (summary.byAsset[asset].totalAmount === 0) {
        delete summary.byAsset[asset];
      }
    });

    // Beräkna genomsnittspris för kvarvarande tillgångar
    Object.keys(summary.byAsset).forEach(asset => {
      const assetData = summary.byAsset[asset];
      if (assetData.totalValue && assetData.totalAmount) {
        assetData.averagePrice = assetData.totalValue / assetData.totalAmount;
      }
    });

    return summary;
  };

  const summary = calculateSummary();

  const formatNumber = (num: number) => {
    return num.toLocaleString('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sammanfattning
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2">Totalt antal transaktioner</Typography>
            <Typography variant="h6">{summary.totalTransactions}</Typography>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Totalt värde</Typography>
            <Typography variant="h6">
              ${summary.totalValue.toLocaleString('sv-SE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>Per tillgång</Typography>
          {Object.entries(summary.byAsset)
            .sort(([assetA], [assetB]) => assetA.localeCompare(assetB))
            .map(([asset, data]) => (
              <Box key={asset} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {asset}: {formatNumber(data.totalAmount)}
                  {data.averagePrice ? ` (Snitt: $${formatNumber(data.averagePrice)})` : ''}
                </Typography>
              </Box>
            ))}
        </Grid>
      </Grid>
    </Paper>
  );
}; 