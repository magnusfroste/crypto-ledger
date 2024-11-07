import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Chip
} from '@mui/material';
import { AssetLedger } from '../types/Ledger';
import { AssetSummary } from './AssetSummary';
import { LedgerEntriesTable } from './LedgerEntriesTable';
import { useSearchParams } from 'react-router-dom';

interface Props {
  ledgers: AssetLedger[];
  prices?: Map<string, number>;
  defaultAsset?: string;
}

export const LedgerView: React.FC<Props> = ({ 
  ledgers, 
  prices,
  defaultAsset 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAsset, setSelectedAsset] = useState<string>(
    defaultAsset || searchParams.get('asset') || ledgers[0]?.asset || ''
  );

  useEffect(() => {
    if (defaultAsset && defaultAsset !== selectedAsset) {
      setSelectedAsset(defaultAsset);
    }
  }, [defaultAsset]);

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);
    searchParams.set('asset', asset);
    setSearchParams(searchParams);
  };

  const currentLedger = ledgers.find(l => l.asset === selectedAsset);
  const currentPrice = prices?.get(selectedAsset);

  if (ledgers.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No ledger entries available</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedAsset}
          onChange={(_, value) => handleAssetChange(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {ledgers.map(ledger => (
            <Tab
              key={ledger.asset}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {ledger.asset}
                  <Chip
                    size="small"
                    label={ledger.currentBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })}
                    color={ledger.currentBalance > 0 ? 'primary' : 'default'}
                  />
                </Box>
              }
              value={ledger.asset}
            />
          ))}
        </Tabs>
      </Paper>

      {currentLedger && (
        <>
          <AssetSummary 
            ledger={currentLedger} 
            currentPrice={currentPrice}
          />
          <LedgerEntriesTable entries={currentLedger.entries} />
        </>
      )}
    </Box>
  );
}; 