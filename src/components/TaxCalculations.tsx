import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent 
} from '@mui/material';
import { Transaction, TaxCalculation } from '../types/Transaction';
import { TaxCalculationDetails } from './TaxCalculationDetails';

interface Props {
  transactions: Transaction[];
}

export const TaxCalculations: React.FC<Props> = ({ transactions }) => {
  // Hitta alla tillgängliga år från transaktionerna
  const availableYears = Array.from(
    new Set(transactions.map(t => t.date.getFullYear()))
  ).sort((a, b) => b - a); // Sortera fallande

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears[0] || new Date().getFullYear() - 1
  );

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number);
  };

  const calculateTax = (transactions: Transaction[], year: number): TaxCalculation[] => {
    const yearTransactions = transactions.filter(
      t => t.date.getFullYear() === year
    );

    const calculations: { [key: string]: TaxCalculation } = {};
    const costBasis: { [key: string]: { amount: number, cost: number }[] } = {};

    // Först, bygg upp FIFO-kön för varje tillgång
    yearTransactions.forEach(t => {
      if (!costBasis[t.asset]) {
        costBasis[t.asset] = [];
      }

      if (t.type === 'BUY' && t.price) {
        costBasis[t.asset].push({
          amount: t.amount,
          cost: t.price
        });
      }
    });

    // Sedan, processa försäljningar
    yearTransactions.forEach(t => {
      if (t.type === 'SELL' && t.price && t.amount) {
        if (!calculations[t.asset]) {
          calculations[t.asset] = {
            year,
            asset: t.asset,
            totalProceeds: 0,
            totalCostBasis: 0,
            realizedGain: 0,
            taxableAmount: 0
          };
        }

        const proceeds = t.price * t.amount;
        calculations[t.asset].totalProceeds += proceeds;

        // Beräkna kostnadsbasis enligt FIFO
        let remainingAmount = t.amount;
        let costBasisForSale = 0;

        while (remainingAmount > 0 && costBasis[t.asset]?.length > 0) {
          const oldestLot = costBasis[t.asset][0];
          const usedAmount = Math.min(remainingAmount, oldestLot.amount);
          
          costBasisForSale += usedAmount * oldestLot.cost;
          remainingAmount -= usedAmount;
          oldestLot.amount -= usedAmount;

          if (oldestLot.amount === 0) {
            costBasis[t.asset].shift();
          }
        }

        calculations[t.asset].totalCostBasis += costBasisForSale;
        calculations[t.asset].realizedGain = 
          calculations[t.asset].totalProceeds - calculations[t.asset].totalCostBasis;
        calculations[t.asset].taxableAmount = calculations[t.asset].realizedGain * 0.3;
      }
    });

    return Object.values(calculations);
  };

  const taxData = calculateTax(transactions, selectedYear);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleExportK4 = () => {
    const csv = [
      ['Tillgång', 'Försäljningspris', 'Omkostnadsbelopp', 'Vinst/Förlust', 'Skattepliktig vinst'].join(','),
      ...taxData.map(calc => [
        calc.asset,
        calc.totalProceeds,
        calc.totalCostBasis,
        calc.realizedGain,
        calc.taxableAmount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-k4-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const [calculationMethod, setCalculationMethod] = useState<'FIFO' | 'AVERAGE'>('FIFO');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Skatteberäkning
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>År</InputLabel>
            <Select
              value={selectedYear}
              label="År"
              onChange={handleYearChange}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Metod</InputLabel>
            <Select
              value={calculationMethod}
              label="Metod"
              onChange={(e) => setCalculationMethod(e.target.value as 'FIFO' | 'AVERAGE')}
            >
              <MenuItem value="FIFO">FIFO</MenuItem>
              <MenuItem value="AVERAGE">Genomsnitt</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleExportK4}>
            Exportera K4-underlag
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tillgång</TableCell>
              <TableCell align="right">Försäljningsintäkter</TableCell>
              <TableCell align="right">Omkostnadsbelopp</TableCell>
              <TableCell align="right">Vinst/Förlust</TableCell>
              <TableCell align="right">Skattepliktig vinst</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxData.map((calc) => (
              <TableRow 
                key={calc.asset} 
                hover 
                onClick={() => setSelectedAsset(calc.asset)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{calc.asset}</TableCell>
                <TableCell align="right">{formatCurrency(calc.totalProceeds)}</TableCell>
                <TableCell align="right">{formatCurrency(calc.totalCostBasis)}</TableCell>
                <TableCell align="right" 
                  sx={{ 
                    color: calc.realizedGain >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {formatCurrency(calc.realizedGain)}
                </TableCell>
                <TableCell align="right">{formatCurrency(calc.taxableAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedAsset && (
        <TaxCalculationDetails
          open={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          asset={selectedAsset}
          transactions={transactions}
          year={selectedYear}
          method={calculationMethod}
        />
      )}
    </Paper>
  );
}; 