import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Crypto Ledger
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/wallets">
            Wallets
          </Button>
          <Button color="inherit" component={RouterLink} to="/transactions">
            Transactions
          </Button>
          <Button color="inherit" component={RouterLink} to="/ledger">
            Ledger
          </Button>
          <Button color="inherit" component={RouterLink} to="/tax">
            Tax Reports
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 