import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  LinearProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { Transaction } from '../types/Transaction';
import { LineChart } from '@mui/x-charts/LineChart';

interface Props {
  transactions: Transaction[];
}

interface PortfolioStats {
  totalValue: number;
  costBasis: number;
  unrealizedGains: number;
  percentageChange: number;
  inflow: number;
  outflow: number;
  income: number;
  expenses: number;
  tradingFees: number;
  realizedGains: number;
}

interface AssetHolding {
  asset: string;
  balance: number;
  costBasis: number;
  marketValue: number;
  roi: number;
  pricePerUnit: number;
  allocation: number;
}

export const Dashboard: React.FC<Props> = ({ transactions }) => {
  const theme = useTheme();

  const calculatePortfolioStats = (): PortfolioStats => {
    const stats: PortfolioStats = {
      totalValue: 0,
      costBasis: 0,
      unrealizedGains: 0,
      percentageChange: 0,
      inflow: 0,
      outflow: 0,
      income: 0,
      expenses: 0,
      tradingFees: 0,
      realizedGains: 0
    };

    transactions.forEach(t => {
      if (t.type === 'BUY') {
        stats.inflow += (t.amount * (t.price || 0));
        stats.costBasis += (t.amount * (t.price || 0));
        if (t.feeAmount) stats.tradingFees += t.feeAmount;
      }
      else if (t.type === 'SELL') {
        stats.outflow += (t.amount * (t.price || 0));
        stats.realizedGains += ((t.price || 0) * t.amount) - (t.amount * (t.price || 0));
        if (t.feeAmount) stats.tradingFees += t.feeAmount;
      }
      else if (t.type === 'STAKING_REWARD') {
        stats.income += (t.amount * (t.price || 0));
      }
    });

    stats.totalValue = stats.costBasis + stats.unrealizedGains;
    stats.percentageChange = (stats.unrealizedGains / stats.costBasis) * 100;

    return stats;
  };

  const calculateHoldings = (): AssetHolding[] => {
    const holdings: { [key: string]: AssetHolding } = {};

    transactions.forEach(t => {
      if (!holdings[t.asset]) {
        holdings[t.asset] = {
          asset: t.asset,
          balance: 0,
          costBasis: 0,
          marketValue: 0,
          roi: 0,
          pricePerUnit: t.price || 0,
          allocation: 0
        };
      }

      const holding = holdings[t.asset];
      
      if (t.type === 'BUY') {
        holding.balance += t.amount;
        holding.costBasis += (t.amount * (t.price || 0));
      }
      else if (t.type === 'SELL') {
        holding.balance -= t.amount;
        holding.costBasis -= (t.amount * (t.price || 0));
      }
      
      holding.marketValue = holding.balance * (t.price || 0);
      holding.roi = ((holding.marketValue - holding.costBasis) / holding.costBasis) * 100;
    });

    const totalValue = Object.values(holdings).reduce((sum, h) => sum + h.marketValue, 0);
    Object.values(holdings).forEach(h => {
      h.allocation = (h.marketValue / totalValue) * 100;
    });

    return Object.values(holdings)
      .filter(h => h.balance > 0)
      .sort((a, b) => b.marketValue - a.marketValue);
  };

  const stats = calculatePortfolioStats();
  const holdings = calculateHoldings();

  // Skapa data för grafen
  const portfolioHistory = transactions.reduce((acc: {date: Date, value: number}[], t) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
    let newValue = lastValue;

    if (t.type === 'BUY') {
      newValue += t.amount * (t.price || 0);
    } else if (t.type === 'SELL') {
      newValue -= t.amount * (t.price || 0);
    }

    acc.push({ date: t.date, value: newValue });
    return acc;
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Portfolio Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" gutterBottom>
              {formatCurrency(stats.totalValue)}
            </Typography>
            <Typography color="success.main" variant="subtitle1">
              +{stats.percentageChange.toFixed(2)}%
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 200 }}>
              <LineChart
                series={[
                  {
                    data: portfolioHistory.map(p => p.value),
                    area: true,
                    color: theme.palette.primary.main
                  }
                ]}
                xAxis={[{
                  data: portfolioHistory.map(p => p.date),
                  scaleType: 'time'
                }]}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">In</Typography>
                <Typography variant="h6">{formatCurrency(stats.inflow)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Out</Typography>
                <Typography variant="h6">{formatCurrency(stats.outflow)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Income</Typography>
                <Typography variant="h6">{formatCurrency(stats.income)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Trading fees</Typography>
                <Typography variant="h6">{formatCurrency(stats.tradingFees)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Realized gains</Typography>
                <Typography variant="h6">{formatCurrency(stats.realizedGains)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Holdings Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Holdings</Typography>
        <Grid container spacing={2}>
          {holdings.map(holding => (
            <Grid item xs={12} key={holding.asset}>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Grid container alignItems="center">
                  <Grid item xs={3}>
                    <Typography variant="subtitle1">{holding.asset}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {holding.balance.toFixed(8)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      {formatCurrency(holding.marketValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      {formatCurrency(holding.pricePerUnit)} / enhet
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography 
                      variant="body2" 
                      color={holding.roi >= 0 ? 'success.main' : 'error.main'}
                    >
                      {holding.roi.toFixed(2)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <LinearProgress 
                      variant="determinate" 
                      value={holding.allocation} 
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}; 