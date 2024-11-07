import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useTransactionContext } from '../contexts/TransactionContext';
import { TaxSettingsDialog } from '../components/TaxSettingsDialog';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { Transaction } from '../types/Transaction';
import { TaxService } from '../services/TaxService';

interface CapitalGainsSummary {
  realizedGains: number;
  realizedLosses: number;
  proceedsFromSales: number;
  costBasis: number;
  fees: number;
  otherCosts: number;
  netCapitalGains: number;
}

interface IncomeSummary {
  payments: number;
  rebatesAndRewards: number;
  gifts: number;
  otherIncome: number;
  totalIncome: number;
}

interface TaxSettings {
  taxJurisdiction: string;
  baseCurrency: string;
  costBasisMethod: 'FIFO' | 'LIFO' | 'Average Cost';
  timeZone: string;
}

export const Tax: React.FC = () => {
  const { transactions } = useTransactionContext();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capitalGains, setCapitalGains] = useState<CapitalGainsSummary | null>(null);
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    taxJurisdiction: 'Sweden',
    baseCurrency: 'SEK',
    costBasisMethod: 'Average Cost',
    timeZone: 'Europe/Stockholm'
  });

  const handleSaveSettings = (newSettings: TaxSettings) => {
    setTaxSettings(newSettings);
  };

  const calculateTaxReport = (yearTransactions: Transaction[]) => {
    const gains: CapitalGainsSummary = {
      realizedGains: 0,
      realizedLosses: 0,
      proceedsFromSales: 0,
      costBasis: 0,
      fees: 0,
      otherCosts: 0,
      netCapitalGains: 0
    };

    const income: IncomeSummary = {
      payments: 0,
      rebatesAndRewards: 0,
      gifts: 0,
      otherIncome: 0,
      totalIncome: 0
    };

    yearTransactions.forEach(tx => {
      if (tx.type === 'SELL') {
        const proceeds = tx.amount * (tx.price || 0);
        gains.proceedsFromSales += proceeds;
        // TODO: Beräkna kostnadsbasis och vinst/förlust
      } else if (tx.type === 'STAKING_REWARD') {
        income.rebatesAndRewards += tx.amount * (tx.price || 0);
      }

      if (tx.feeAmount) {
        gains.fees += tx.feeAmount;
      }
    });

    gains.netCapitalGains = gains.realizedGains - gains.realizedLosses - gains.fees - gains.otherCosts;
    income.totalIncome = income.payments + income.rebatesAndRewards + income.gifts + income.otherIncome;

    return { gains, income };
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const yearTransactions = transactions.filter(t => 
        t.date.getFullYear() === selectedYear
      );

      const { gains, income } = calculateTaxReport(yearTransactions);
      setCapitalGains(gains);
      setIncomeSummary(income);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Failed to generate tax report');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatSEK = (amount: number): string => {
    return `SEK ${amount.toLocaleString('sv-SE', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tax Reports
        </Typography>
        <Button
          startIcon={<SettingsIcon />}
          onClick={() => setIsSettingsOpen(true)}
        >
          Edit Settings
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Tax Report
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as number)}
              >
                {Array.from(
                  { length: 5 }, 
                  (_, i) => new Date().getFullYear() - i
                ).map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={generateReport}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {capitalGains && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Capital Gains Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Realized Capital Gains</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.realizedGains)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Realized Capital Losses</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.realizedLosses)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Proceeds from sales</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.proceedsFromSales)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cost Basis</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.costBasis)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fees</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.fees)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Net Capital Gains</TableCell>
                      <TableCell align="right">
                        {formatSEK(capitalGains.netCapitalGains)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {incomeSummary && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Income Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Payments</TableCell>
                      <TableCell align="right">
                        {formatSEK(incomeSummary.payments)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rebate and Rewards</TableCell>
                      <TableCell align="right">
                        {formatSEK(incomeSummary.rebatesAndRewards)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Income</TableCell>
                      <TableCell align="right">
                        {formatSEK(incomeSummary.totalIncome)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      <TaxSettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={taxSettings}
        onSave={handleSaveSettings}
      />
    </Box>
  );
};

export {}; 