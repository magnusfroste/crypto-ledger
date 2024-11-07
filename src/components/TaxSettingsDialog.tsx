import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';

interface TaxSettings {
  taxJurisdiction: string;
  baseCurrency: string;
  costBasisMethod: 'FIFO' | 'LIFO' | 'Average Cost';
  timeZone: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  settings: TaxSettings;
  onSave: (settings: TaxSettings) => void;
}

export const TaxSettingsDialog: React.FC<Props> = ({
  open,
  onClose,
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<TaxSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tax Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Tax Jurisdiction</InputLabel>
              <Select
                value={localSettings.taxJurisdiction}
                label="Tax Jurisdiction"
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  taxJurisdiction: e.target.value as string
                })}
              >
                <MenuItem value="Sweden">Sweden</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Base Currency</InputLabel>
              <Select
                value={localSettings.baseCurrency}
                label="Base Currency"
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  baseCurrency: e.target.value as string
                })}
              >
                <MenuItem value="SEK">SEK</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cost Basis Method</InputLabel>
              <Select
                value={localSettings.costBasisMethod}
                label="Cost Basis Method"
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  costBasisMethod: e.target.value as 'FIFO' | 'LIFO' | 'Average Cost'
                })}
              >
                <MenuItem value="FIFO">First In, First Out (FIFO)</MenuItem>
                <MenuItem value="LIFO">Last In, First Out (LIFO)</MenuItem>
                <MenuItem value="Average Cost">Average Cost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 