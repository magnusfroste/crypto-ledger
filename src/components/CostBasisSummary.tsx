import React from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { Transaction } from '../types/Transaction';

interface CostBasis {
  asset: string;
  totalAmount: number;
  totalCost: number;
  averageCost: number;
  currentValue?: number;
  realizedGains: number;
}

interface Props {
  transactions: Transaction[];
}

export const CostBasisSummary: React.FC<Props> = ({ transactions }) => {
  const calculateCostBasis = (): CostBasis[] => {
    const costBasis: { [key: string]: CostBasis } = {};

    // Sortera transaktioner efter datum
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    sortedTransactions.forEach(t => {
      if (!costBasis[t.asset]) {
        costBasis[t.asset] = {
          asset: t.asset,
          totalAmount: 0,
          totalCost: 0,
          averageCost: 0,
          realizedGains: 0
        };
      }

      const asset = costBasis[t.asset];

      if (t.type === 'BUY') {
        // Köp: Lägg till i genomsnittligt anskaffningsvärde
        const cost = t.amount * (t.price || 0);
        asset.totalCost += cost;
        asset.totalAmount += t.amount;
        asset.averageCost = asset.totalCost / asset.totalAmount;
      } 
      else if (t.type === 'SELL') {
        // Sälj: Beräkna realiserad vinst/förlust
        const sellValue = t.amount * (t.price || 0);
        const costBasisForSale = t.amount * asset.averageCost;
        asset.realizedGains += sellValue - costBasisForSale;
        asset.totalAmount -= t.amount;
        asset.totalCost = asset.totalAmount * asset.averageCost;
      }
    });

    return Object.values(costBasis)
      .filter(asset => asset.totalAmount > 0 || asset.realizedGains !== 0)
      .sort((a, b) => b.totalCost - a.totalCost);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const costBasisData = calculateCostBasis();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Omkostnadsbelopp
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tillgång</TableCell>
              <TableCell align="right">Innehav</TableCell>
              <TableCell align="right">Genomsnittligt anskaffningsvärde</TableCell>
              <TableCell align="right">Totalt anskaffningsvärde</TableCell>
              <TableCell align="right">Realiserad vinst/förlust</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costBasisData.map((asset) => (
              <TableRow key={asset.asset}>
                <TableCell>{asset.asset}</TableCell>
                <TableCell align="right">{formatNumber(asset.totalAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(asset.averageCost)}</TableCell>
                <TableCell align="right">{formatCurrency(asset.totalCost)}</TableCell>
                <TableCell align="right" 
                  sx={{ 
                    color: asset.realizedGains >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {formatCurrency(asset.realizedGains)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}; 