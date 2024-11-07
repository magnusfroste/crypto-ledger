import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  LinearProgress
} from '@mui/material';
import { useTransactionContext } from '../contexts/TransactionContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface PieDataEntry {
  name: string;
  value: number;
}

export const Dashboard: React.FC = () => {
  const { holdings, totalValue, performance24h, wallets } = useTransactionContext();
  const navigate = useNavigate();

  const pieData: PieDataEntry[] = holdings.map(holding => ({
    name: holding.asset,
    value: holding.value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleAssetClick = (asset: string) => {
    navigate(`/ledger?asset=${asset}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Portfolio Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Portfolio Value
            </Typography>
            <Typography variant="h4">
              {formatCurrency(totalValue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography 
                color={performance24h >= 0 ? 'success.main' : 'error.main'}
                variant="body2"
              >
                {formatPercentage(performance24h)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Last 24h
              </Typography>
            </Box>

            <Box sx={{ height: 200, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry: PieDataEntry, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => 
                      `${formatCurrency(value)} (${formatPercentage((value/totalValue)*100)})`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Assets
            </Typography>
            {holdings.map((holding, index) => (
              <Card 
                key={holding.asset} 
                sx={{ 
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleAssetClick(holding.asset)}
              >
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid item xs={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: COLORS[index % COLORS.length],
                            mr: 1
                          }}
                        />
                        <Typography variant="subtitle1">
                          {holding.asset}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>
                        {formatNumber(holding.amount, 8)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>
                        {formatCurrency(holding.value)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          color={holding.change24h >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercentage(holding.change24h)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <LinearProgress 
                    variant="determinate" 
                    value={(holding.value / totalValue) * 100}
                    sx={{ 
                      mt: 1,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: COLORS[index % COLORS.length]
                      }
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};