import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  Alert,
  Fade
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

export const SidebarSummary = ({
  quotationData,
  autoSaveStatus,
  formatCurrency,
  calculateSubtotal,
  calculateMarkup,
  calculateTax,
  calculateGrandTotal
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'sticky', 
        top: 120, 
        p: 3, 
        backgroundColor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <ReceiptIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Quote Summary
        </Typography>
      </Box>
      
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Items Count
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {quotationData.items.length}
          </Typography>
        </Box>
        
        <Divider />
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="h6">
            {formatCurrency(calculateSubtotal())}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Markup ({quotationData.markupPercentage}%)
          </Typography>
          <Typography variant="body1">
            {formatCurrency(calculateMarkup())}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Tax ({quotationData.taxRate}%)
          </Typography>
          <Typography variant="body1">
            {formatCurrency(calculateTax())}
          </Typography>
        </Box>
        
        <Divider />
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Grand Total
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {formatCurrency(calculateGrandTotal())}
          </Typography>
        </Box>
        
        {autoSaveStatus && (
          <Fade in={!!autoSaveStatus}>
            <Alert severity="success" size="small">
              {autoSaveStatus}
            </Alert>
          </Fade>
        )}
      </Stack>
    </Paper>
  );
};