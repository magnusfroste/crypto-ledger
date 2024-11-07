import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  SelectChangeEvent 
} from '@mui/material';
import { TransactionType } from '../types/Transaction';

interface Props {
  onTypeFilter: (type: TransactionType | 'ALL') => void;
  onAssetFilter: (asset: string) => void;
  onDateRangeFilter: (startDate: Date | null, endDate: Date | null) => void;
  availableAssets: string[];
}

export const TransactionFilters: React.FC<Props> = ({
  onTypeFilter,
  onAssetFilter,
  onDateRangeFilter,
  availableAssets
}) => {
  const handleTypeChange = (event: SelectChangeEvent) => {
    onTypeFilter(event.target.value as TransactionType | 'ALL');
  };

  const handleAssetChange = (event: SelectChangeEvent) => {
    onAssetFilter(event.target.value);
  };

  const handleDateChange = (field: 'start' | 'end') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    if (field === 'start') {
      onDateRangeFilter(date, null);
    } else {
      onDateRangeFilter(null, date);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Typ</InputLabel>
        <Select label="Typ" onChange={handleTypeChange} defaultValue="ALL">
          <MenuItem value="ALL">Alla</MenuItem>
          <MenuItem value="BUY">Köp</MenuItem>
          <MenuItem value="SELL">Sälj</MenuItem>
          <MenuItem value="TRANSFER">Överföring</MenuItem>
          <MenuItem value="STAKING_REWARD">Staking</MenuItem>
          <MenuItem value="FEE">Avgift</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Tillgång</InputLabel>
        <Select label="Tillgång" onChange={handleAssetChange} defaultValue="ALL">
          <MenuItem value="ALL">Alla</MenuItem>
          {availableAssets.map(asset => (
            <MenuItem key={asset} value={asset}>{asset}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="date"
        label="Från datum"
        InputLabelProps={{ shrink: true }}
        onChange={handleDateChange('start')}
      />

      <TextField
        type="date"
        label="Till datum"
        InputLabelProps={{ shrink: true }}
        onChange={handleDateChange('end')}
      />
    </Box>
  );
}; 