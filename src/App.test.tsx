import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/wallets/i)).toBeInTheDocument();
  expect(screen.getByText(/transactions/i)).toBeInTheDocument();
  expect(screen.getByText(/ledger/i)).toBeInTheDocument();
  expect(screen.getByText(/tax reports/i)).toBeInTheDocument();
});

export {};
