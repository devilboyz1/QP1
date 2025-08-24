import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Sample data for demonstration (replace with actual API call)
  const sampleQuotations = [
    {
      id: 1,
      quotation_no: 'QT-2024-001',
      title: 'Office Furniture Set',
      description: 'Complete office furniture package for startup company',
      total_cost: 15750.00,
      status: 'draft',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      quotation_no: 'QT-2024-002',
      title: 'Custom Kitchen Cabinets',
      description: 'Bespoke kitchen cabinet solution with premium materials',
      total_cost: 28500.00,
      status: 'issued',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-16T09:15:00Z'
    },
    {
      id: 3,
      quotation_no: 'QT-2024-003',
      title: 'Conference Room Setup',
      description: 'Complete conference room furniture and equipment',
      total_cost: 12300.00,
      status: 'accepted',
      created_at: '2024-01-12T11:45:00Z',
      updated_at: '2024-01-18T16:30:00Z'
    },
    {
      id: 4,
      quotation_no: 'QT-2024-004',
      title: 'Retail Display Units',
      description: 'Custom display units for retail store renovation',
      total_cost: 8750.00,
      status: 'rejected',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-17T13:20:00Z'
    },
    {
      id: 5,
      quotation_no: 'QT-2024-005',
      title: 'Warehouse Shelving System',
      description: 'Industrial shelving solution for warehouse optimization',
      total_cost: 45200.00,
      status: 'draft',
      created_at: '2024-01-20T08:15:00Z',
      updated_at: '2024-01-20T08:15:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/quotations', {
        //   credentials: 'include'
        // });
        // const data = await response.json();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setQuotations(sampleQuotations);
        setError(null);
      } catch (err) {
        setError('Failed to fetch quotations');
        console.error('Error fetching quotations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'default';
      case 'issued':
        return 'primary';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNewQuotation = () => {
    // TODO: Navigate to new quotation form
    console.log('Navigate to new quotation form');
    navigate('/quotations/new');
  };

  const handleEdit = (quotationId) => {
    console.log('Edit quotation:', quotationId);
    // TODO: Navigate to edit form
    // navigate(`/quotations/${quotationId}/edit`);
  };

  const handleView = (quotationId) => {
    console.log('View quotation:', quotationId);
    // TODO: Navigate to view page
    // navigate(`/quotations/${quotationId}`);
  };

  const handleDelete = (quotationId) => {
    console.log('Delete quotation:', quotationId);
    // TODO: Show confirmation dialog and delete
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(prev => prev.filter(q => q.id !== quotationId));
    }
  };

  const handleDownload = (quotationId) => {
    console.log('Download quotation PDF:', quotationId);
    // TODO: Download PDF
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section with Primary Action Button */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Quotations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleNewQuotation}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          New Quotation
        </Button>
      </Box>

      {/* Quotations Table - Increased width */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: 2,
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Table sx={{ minWidth: 900 }} aria-label="quotations table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 140 }}>Quotation No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 250 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 120 }}>Total Cost</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 100 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 100 }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 180 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow 
                key={quotation.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'grey.50',
                    cursor: 'pointer'
                  },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                  {quotation.quotation_no}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {quotation.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {quotation.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatCurrency(quotation.total_cost)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    color={getStatusColor(quotation.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {formatDate(quotation.created_at)}
                </TableCell>
                <TableCell align="center">
                  {/* Improved action buttons alignment */}
                  <Box 
                    display="flex" 
                    gap={0.5} 
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: 40 }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleView(quotation.id)}
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { backgroundColor: 'primary.50' },
                          width: 32,
                          height: 32
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {quotation.status === 'draft' && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(quotation.id)}
                          sx={{ 
                            color: 'warning.main',
                            '&:hover': { backgroundColor: 'warning.50' },
                            width: 32,
                            height: 32
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Download PDF">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(quotation.id)}
                        sx={{ 
                          color: 'info.main',
                          '&:hover': { backgroundColor: 'info.50' },
                          width: 32,
                          height: 32
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {quotation.status === 'draft' && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(quotation.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.50' },
                            width: 32,
                            height: 32
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {quotations.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No quotations found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Get started by creating your first quotation
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewQuotation}
          >
            Create New Quotation
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default QuotationsPage;