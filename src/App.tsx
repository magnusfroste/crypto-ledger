import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { Navigation } from './components/Navigation';
import { Dashboard, Transactions, Wallets, Tax, Ledger } from './pages';
import { TransactionProvider } from './contexts/TransactionContext';

function App() {
  return (
    <TransactionProvider>
      <BrowserRouter>
        <Navigation />
        <Container>
          <Box sx={{ my: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/tax" element={<Tax />} />
            </Routes>
          </Box>
        </Container>
      </BrowserRouter>
    </TransactionProvider>
  );
}

export default App;