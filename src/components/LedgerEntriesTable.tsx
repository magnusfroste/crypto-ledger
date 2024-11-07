import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';
import { LedgerEntry } from '../types/Ledger';

interface Props {
  entries: LedgerEntry[];
}

export const LedgerEntriesTable: React.FC<Props> = ({ entries }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatNumber = (num: number) => {
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Change</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="right">Average Cost</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Transaction ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry) => (
                <TableRow 
                  key={entry.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={entry.change > 0 ? 'success.main' : 'error.main'}
                    >
                      {entry.change > 0 ? '+' : ''}{formatNumber(entry.change)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatNumber(entry.balance)}</TableCell>
                  <TableCell align="right">
                    {entry.averageCost 
                      ? `$${formatNumber(entry.averageCost)}` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{entry.platform}</TableCell>
                  <TableCell>
                    <Tooltip title={entry.transactionId}>
                      <Typography noWrap sx={{ maxWidth: 150 }}>
                        {entry.transactionId.substring(0, 8)}...
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={entries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export {}; 