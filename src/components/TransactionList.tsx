import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Tooltip,
  Typography,
  Box,
  TablePagination,
  TableSortLabel,
  IconButton,
  Collapse,
  Grid 
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Transaction } from '../types/Transaction';

interface Props {
  transactions: Transaction[];
}

interface SortConfig {
  field: keyof Transaction;
  direction: 'asc' | 'desc';
}

export const TransactionList: React.FC<Props> = ({ transactions }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sort, setSort] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: keyof Transaction) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const multiplier = sort.direction === 'asc' ? 1 : -1;
      if (sort.field === 'date') {
        return (a.date.getTime() - b.date.getTime()) * multiplier;
      }
      return 0;
    });
  }, [transactions, sort]);

  const paginatedTransactions = sortedTransactions.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>
              <TableSortLabel
                active={sort.field === 'date'}
                direction={sort.direction}
                onClick={() => handleSort('date')}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Total Value</TableCell>
            <TableCell align="right">Fee</TableCell>
            <TableCell>Platform</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTransactions.map((transaction) => (
            <React.Fragment key={transaction.id}>
              <TableRow 
                hover
                onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <IconButton size="small">
                    {expandedRow === transaction.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.asset}</TableCell>
                <TableCell align="right">{formatNumber(transaction.amount)}</TableCell>
                <TableCell align="right">
                  {transaction.price ? `$${formatNumber(transaction.price)}` : '-'}
                </TableCell>
                <TableCell align="right">
                  {transaction.totalValue ? `$${formatNumber(transaction.totalValue)}` : '-'}
                </TableCell>
                <TableCell align="right">
                  {transaction.feeAmount ? (
                    <Tooltip title={transaction.feeCurrency || 'Unknown'}>
                      <span>{formatNumber(transaction.feeAmount)}</span>
                    </Tooltip>
                  ) : '-'}
                </TableCell>
                <TableCell>{transaction.platform}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                  <Collapse in={expandedRow === transaction.id} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Transaction Details
                      </Typography>
                      <Grid container spacing={2}>
                        {(transaction.sentAmount || transaction.receivedAmount) && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Swap Details
                            </Typography>
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
                          </Grid>
                        )}

                        {transaction.netWorthAmount && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Portfolio Value at Time
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrencyValue(transaction.netWorthAmount, transaction.netWorthCurrency)}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Additional Information
                          </Typography>
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
                          {transaction.notes && (
                            <Typography variant="body2">
                              Notes: {transaction.notes}
                            </Typography>
                          )}
                          {transaction.txHash && (
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              Transaction Hash: {transaction.txHash}
                            </Typography>
                          )}
                          {transaction.tradeId && (
                            <Typography variant="body2">
                              Trade ID: {transaction.tradeId}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );
};

export {}; 