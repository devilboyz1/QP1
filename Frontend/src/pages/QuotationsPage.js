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
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  DeleteSweep as DeleteSweepIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DraftIcon,
  Send as SendIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedQuotations, setSelectedQuotations] = useState([]);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  // Sample data with created_by field
  const sampleQuotations = [
    {
      id: 1,
      quotation_no: 'QT-2024-001',
      title: 'Office Furniture Set',
      description: 'Complete office furniture package for startup company',
      total_cost: 15750.00,
      status: 'draft',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      created_by: 'John Smith'
    },
    {
      id: 2,
      quotation_no: 'QT-2024-002',
      title: 'Custom Kitchen Cabinets',
      description: 'Bespoke kitchen cabinet solution with premium materials',
      total_cost: 28500.00,
      status: 'issued',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-16T09:15:00Z',
      created_by: 'Sarah Johnson'
    },
    {
      id: 3,
      quotation_no: 'QT-2024-003',
      title: 'Conference Room Setup',
      description: 'Complete conference room furniture and equipment',
      total_cost: 12300.00,
      status: 'accepted',
      created_at: '2024-01-12T11:45:00Z',
      updated_at: '2024-01-18T16:30:00Z',
      created_by: 'Mike Davis'
    },
    {
      id: 4,
      quotation_no: 'QT-2024-004',
      title: 'Retail Display Units',
      description: 'Custom display units for retail store renovation',
      total_cost: 8750.00,
      status: 'rejected',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-17T13:20:00Z',
      created_by: 'Emily Wilson'
    },
    {
      id: 5,
      quotation_no: 'QT-2024-005',
      title: 'Warehouse Shelving System',
      description: 'Industrial shelving solution for warehouse optimization',
      total_cost: 45200.00,
      status: 'draft',
      created_at: '2024-01-20T08:15:00Z',
      updated_at: '2024-01-20T08:15:00Z',
      created_by: 'John Smith'
    }
  ];

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
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

  // Filter and sort quotations
  useEffect(() => {
    let filtered = [...quotations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.quotation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(q => {
        const createdDate = new Date(q.created_at);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (start && end) {
          return createdDate >= start && createdDate <= end;
        } else if (start) {
          return createdDate >= start;
        } else if (end) {
          return createdDate <= end;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'total_cost') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredQuotations(filtered);
  }, [quotations, searchTerm, statusFilter, sortConfig, dateRange]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedQuotations(filteredQuotations.map(q => q.id));
    } else {
      setSelectedQuotations([]);
    }
  };

  const handleSelectQuotation = (quotationId) => {
    setSelectedQuotations(prev => 
      prev.includes(quotationId)
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const handleBulkDelete = () => {
    setQuotations(prev => prev.filter(q => !selectedQuotations.includes(q.id)));
    setSelectedQuotations([]);
    setBulkMenuAnchor(null);
  };

  const handleBulkExport = () => {
    console.log('Exporting quotations:', selectedQuotations);
    setBulkMenuAnchor(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'issued': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <DraftIcon fontSize="small" />;
      case 'issued': return <SendIcon fontSize="small" />;
      case 'accepted': return <CheckCircleIcon fontSize="small" />;
      case 'rejected': return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleNewQuotation = () => {
    navigate('/quotations/new');
  };

  const handleView = (quotationId) => {
    console.log('View quotation:', quotationId);
  };

  const handleEdit = (quotationId) => {
    navigate(`/quotations/edit/${quotationId}`);
  };

  const handleDelete = (quotationId) => {
    setQuotations(prev => prev.filter(q => q.id !== quotationId));
  };

  const handleDownload = (quotationId) => {
    console.log('Download quotation PDF:', quotationId);
  };

  const SortableTableCell = ({ children, sortKey, align = 'left', ...props }) => {
    const isActive = sortConfig.key === sortKey;
    const direction = isActive ? sortConfig.direction : 'asc';

    return (
      <TableCell
        {...props}
        align={align}
        sx={{
          fontWeight: 'bold',
          fontSize: '0.95rem',
          cursor: sortKey ? 'pointer' : 'default',
          userSelect: 'none',
          '&:hover': sortKey ? { backgroundColor: 'grey.100' } : {},
          ...props.sx
        }}
        onClick={sortKey ? () => handleSort(sortKey) : undefined}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          {children}
          {sortKey && (
            <Box display="flex" flexDirection="column" ml={0.5}>
              <ArrowUpwardIcon 
                fontSize="small" 
                sx={{ 
                  fontSize: '12px',
                  color: isActive && direction === 'asc' ? 'primary.main' : 'grey.400'
                }} 
              />
              <ArrowDownwardIcon 
                fontSize="small" 
                sx={{ 
                  fontSize: '12px',
                  marginTop: '-2px',
                  color: isActive && direction === 'desc' ? 'primary.main' : 'grey.400'
                }} 
              />
            </Box>
          )}
        </Box>
      </TableCell>
    );
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
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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

      {/* Filters and Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="issued">Issued</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            {selectedQuotations.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<MoreVertIcon />}
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                fullWidth
                size="small"
              >
                Actions ({selectedQuotations.length})
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={handleBulkExport}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Selected</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBulkDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteSweepIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Quotations Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: 2,
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Table sx={{ minWidth: 1000 }} aria-label="quotations table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedQuotations.length > 0 && selectedQuotations.length < filteredQuotations.length}
                  checked={filteredQuotations.length > 0 && selectedQuotations.length === filteredQuotations.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <SortableTableCell sortKey="quotation_no" sx={{ minWidth: 140 }}>
                Quotation No.
              </SortableTableCell>
              <SortableTableCell sortKey="title" sx={{ minWidth: 250 }}>
                Title
              </SortableTableCell>
              <SortableTableCell sortKey="total_cost" sx={{ minWidth: 120 }}>
                Total Cost
              </SortableTableCell>
              <SortableTableCell sortKey="status" sx={{ minWidth: 100 }}>
                Status
              </SortableTableCell>
              <SortableTableCell sortKey="created_at" sx={{ minWidth: 100 }}>
                Created
              </SortableTableCell>
              <SortableTableCell sortKey="created_by" sx={{ minWidth: 120 }}>
                Created By
              </SortableTableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 180 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuotations.map((quotation, index) => (
              <TableRow 
                key={quotation.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'grey.50',
                    cursor: 'pointer'
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: 'grey.25'
                  },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQuotations.includes(quotation.id)}
                    onChange={() => handleSelectQuotation(quotation.id)}
                  />
                </TableCell>
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
                    icon={getStatusIcon(quotation.status)}
                    label={quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    color={getStatusColor(quotation.status)}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        fontSize: '16px'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {formatDate(quotation.created_at)}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(quotation.created_by)}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {quotation.created_by}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
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
                            color: 'info.main',
                            '&:hover': { backgroundColor: 'info.50' },
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
                          color: 'success.main',
                          '&:hover': { backgroundColor: 'success.50' },
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
      {filteredQuotations.length === 0 && !loading && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end 
              ? 'No quotations match your filters' 
              : 'No quotations found'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first quotation'
            }
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