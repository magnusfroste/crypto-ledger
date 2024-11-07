import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { Transaction } from '../types/Transaction';

interface Props {
  open: boolean;
  onClose: () => void;
  asset: string;
  transactions: Transaction[];
  year: number;
  method: 'FIFO' | 'AVERAGE';
}

interface LotDetail {
  date: Date;
  amount: number;
  price: number;
  total: number;
  remaining?: number;
  usedFor?: string;
}

interface DetailsResult {
  method: 'FIFO' | 'AVERAGE';
  lots?: LotDetail[];
  purchases?: LotDetail[];
  sales: LotDetail[];
  runningLots?: LotDetail[];
}

export const TaxCalculationDetails: React.FC<Props> = ({ 
  open, 
  onClose, 
  asset, 
  transactions,
  year,
  method
}) => {
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
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    });
  };

  const calculateFIFODetails = (): DetailsResult => {
    const lots: LotDetail[] = [];
    const sales: LotDetail[] = [];
    let runningLots: LotDetail[] = [];

    transactions
      .filter(t => t.asset === asset && t.date.getFullYear() <= year)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(t => {
        if (t.type === 'BUY' && t.price) {
          const lot: LotDetail = {
            date: t.date,
            amount: t.amount,
            price: t.price,
            total: t.amount * t.price,
            remaining: t.amount
          };
          lots.push(lot);
          runningLots.push(lot);
        } 
        else if (t.type === 'SELL' && t.price && t.date.getFullYear() === year) {
          let remainingToSell = t.amount;
          const salePrice = t.price;
          const saleLot: LotDetail = {
            date: t.date,
            amount: t.amount,
            price: salePrice,
            total: t.amount * salePrice
          };
          sales.push(saleLot);

          while (remainingToSell > 0 && runningLots.length > 0) {
            const oldestLot = runningLots[0];
            const amountFromLot = Math.min(remainingToSell, oldestLot.remaining!);
            oldestLot.remaining! -= amountFromLot;
            remainingToSell -= amountFromLot;

            if (oldestLot.remaining! <= 0) {
              runningLots.shift();
            }
          }
        }
      });

    return { method: 'FIFO', lots, sales, runningLots };
  };

  const calculateAverageDetails = (): DetailsResult => {
    let totalAmount = 0;
    let totalCost = 0;
    const purchases: LotDetail[] = [];
    const sales: LotDetail[] = [];

    transactions
      .filter(t => t.asset === asset && t.date.getFullYear() <= year)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(t => {
        if (t.type === 'BUY' && t.price) {
          totalAmount += t.amount;
          totalCost += t.amount * t.price;
          purchases.push({
            date: t.date,
            amount: t.amount,
            price: t.price,
            total: t.amount * t.price
          });
        } 
        else if (t.type === 'SELL' && t.price && t.date.getFullYear() === year) {
          const averagePrice = totalCost / totalAmount;
          sales.push({
            date: t.date,
            amount: t.amount,
            price: t.price,
            total: t.amount * t.price,
            usedFor: `Genomsnittspris: ${formatCurrency(averagePrice)}`
          });
          totalAmount -= t.amount;
          totalCost = totalAmount * averagePrice;
        }
      });

    return { method: 'AVERAGE', purchases, sales };
  };

  const details = method === 'FIFO' ? calculateFIFODetails() : calculateAverageDetails();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Detaljerad beräkning för {asset} ({year}) - {method}
      </DialogTitle>
      <DialogContent>
        {method === 'FIFO' ? (
          <>
            <Typography variant="h6" gutterBottom>Inköp (FIFO-ordning)</Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell align="right">Mängd</TableCell>
                    <TableCell align="right">Pris</TableCell>
                    <TableCell align="right">Totalt</TableCell>
                    <TableCell align="right">Kvar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.lots?.map((lot: LotDetail, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{lot.date.toLocaleDateString()}</TableCell>
                      <TableCell align="right">{formatNumber(lot.amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(lot.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(lot.total)}</TableCell>
                      <TableCell align="right">{formatNumber(lot.remaining || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>Inköp (Genomsnittsmetoden)</Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell align="right">Mängd</TableCell>
                    <TableCell align="right">Pris</TableCell>
                    <TableCell align="right">Totalt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.purchases?.map((purchase: LotDetail, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{purchase.date.toLocaleDateString()}</TableCell>
                      <TableCell align="right">{formatNumber(purchase.amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(purchase.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(purchase.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Typography variant="h6" gutterBottom>Försäljningar {year}</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell align="right">Mängd</TableCell>
                <TableCell align="right">Pris</TableCell>
                <TableCell align="right">Totalt</TableCell>
                {method === 'AVERAGE' && <TableCell>Använt pris</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(method === 'FIFO' ? details.sales : details.sales).map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                  <TableCell align="right">{formatNumber(sale.amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(sale.price)}</TableCell>
                  <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                  {method === 'AVERAGE' && <TableCell>{sale.usedFor}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}; 