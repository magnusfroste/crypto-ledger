import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Divider,
  ListItemButton
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudSync as CloudSyncIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { WalletUpload } from './WalletUpload';
import { Transaction } from '../types/Transaction';

interface Props {
  open: boolean;
  onClose: () => void;
  platform: string;
  onTransactionsLoaded: (transactions: Transaction[]) => void;
  existingTransactions: Transaction[];
}

export const AddWalletDialog: React.FC<Props> = ({
  open,
  onClose,
  platform,
  onTransactionsLoaded,
  existingTransactions
}) => {
  const [walletName, setWalletName] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleClose = () => {
    setWalletName('');
    setShowFileUpload(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            Connect {platform} Wallet
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Wallet Name"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Import Data...
        </Typography>

        {!showFileUpload ? (
          <List>
            <ListItem
              disablePadding
              sx={{ 
                bgcolor: 'action.hover', 
                mb: 1, 
                borderRadius: 1,
                opacity: 0.6,
                pointerEvents: 'none'
              }}
            >
              <ListItemButton disabled>
                <ListItemIcon>
                  <CloudSyncIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Configure Auto-sync" 
                  secondary="Your transactions will be imported automatically"
                />
              </ListItemButton>
            </ListItem>

            <ListItem
              disablePadding
              sx={{ 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <ListItemButton onClick={() => setShowFileUpload(true)}>
                <ListItemIcon>
                  <UploadIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Import from file" 
                  secondary="Download your transaction history and upload manually"
                />
              </ListItemButton>
            </ListItem>
          </List>
        ) : (
          <Box>
            <Button 
              sx={{ mb: 2 }}
              onClick={() => setShowFileUpload(false)}
            >
              ← Back
            </Button>
            <WalletUpload 
              onTransactionsLoaded={(transactions) => {
                onTransactionsLoaded(transactions);
                handleClose();
              }}
              existingTransactions={existingTransactions}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Button 
          variant="text" 
          onClick={handleClose}
          sx={{ float: 'right' }}
        >
          Create without data
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export {}; // Gör filen till en modul 