import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTransactionContext } from '../contexts/TransactionContext';
import { WalletUpload } from '../components/WalletUpload';
import { MoreVert as MoreVertIcon, 
         Sync as SyncIcon,
         Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types/Transaction';
import { formatCurrency } from '../utils/formatters';

export const Wallets: React.FC = () => {
  const { wallets, totalValue, removeWallet, addTransactions } = useTransactionContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, walletId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedWalletId(walletId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWalletId(null);
  };

  const handleWalletClick = (walletId: string) => {
    navigate(`/transactions?wallet_id=${walletId}`);
  };

  const handleRemoveWallet = () => {
    if (selectedWalletId) {
      removeWallet(selectedWalletId);
      handleMenuClose();
    }
  };

  const handleTransactionsLoaded = (transactions: Transaction[]) => {
    addTransactions(transactions);
    setIsUploadDialogOpen(false);
  };

  const filteredWallets = wallets.filter(wallet => 
    wallet.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Wallets <Chip label={wallets.length} size="small" />
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Add Wallet
          </Button>
          <Button 
            variant="outlined"
            startIcon={<SyncIcon />}
          >
            Sync All
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search wallets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        {filteredWallets.map((wallet) => (
          <Grid item xs={12} key={wallet.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleWalletClick(wallet.id)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{wallet.platform}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {wallet.transactionCount} transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {wallet.lastUpdated.toLocaleDateString('en-US')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={formatCurrency(
                      (wallet.assets || [])
                        .reduce((sum: number, asset: { balance: number; price?: number }) => {
                          const balance = asset.balance || 0;
                          const price = asset.price || 0;
                          return sum + (balance * price);
                        }, 0)
                    )}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, wallet.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          // Implement sync function
        }}>
          Sync
        </MenuItem>
        <MenuItem onClick={handleRemoveWallet} sx={{ color: 'error.main' }}>
          Remove
        </MenuItem>
      </Menu>

      <Dialog 
        open={isUploadDialogOpen} 
        onClose={() => setIsUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Wallet</DialogTitle>
        <DialogContent>
          <WalletUpload 
            onTransactionsLoaded={handleTransactionsLoaded} 
            existingTransactions={transactions}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export {};