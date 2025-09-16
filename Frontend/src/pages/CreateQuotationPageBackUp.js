import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  Container,
  Autocomplete,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  FormHelperText,
  Snackbar,
  Stack,
  Fade,
  LinearProgress,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  AccountCircle as AccountIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Home as HomeIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import constants and utilities
import {
  unitTypes,
  pricingMethods,
  costingMethods,
  cabinetTypes,
  componentTypes,
  customerTypes,
  projectTypes,
  currencies,
  salesRepresentatives,
  defaultQuotationData,
  defaultNewItem,
  defaultNewComponent
} from '../constants/quotationConstants';

import {
  calculateLinearFeet,
  calculateDisplayValue,
  calculateItemCostBreakdown,
  calculateItemCost,
  calculateSubtotal,
  calculateMarkup,
  calculateTax,
  calculateGrandTotal,
  formatCurrency,
  generateQuotationNumber
} from '../utils/quotationUtils';

import {
  validateField,
  validateForm,
  getFieldError,
  hasFieldError
} from '../utils/validationUtils';

import {
  mockClients,
  mockMaterials,
  mockComponents
} from '../data/mockData';

import { SidebarSummary } from '../components/quotation/SidebarSummary';
import { ClientSearchDialog } from '../components/quotation/ClientSearchDialog';
import { QuotationItemCard } from '../components/quotation/QuotationItemCard';

const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeCalculations, setRealTimeCalculations] = useState({});
  
  // Fix the quotationData state initialization
  const [quotationData, setQuotationData] = useState(defaultQuotationData);
  
  const [expandedItems, setExpandedItems] = useState({});
  
  // Use imported mock data
  const [clients, setClients] = useState(mockClients);
  const [materials, setMaterials] = useState(mockMaterials);
  const [components, setComponents] = useState(mockComponents);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (quotationData.title || quotationData.client || quotationData.items.length > 0) {
        handleAutoSave();
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [quotationData]);

  useEffect(() => {
    // Generate auto quotation number
    const quotationNo = generateQuotationNumber();
    setQuotationData(prev => ({
      ...prev,
      title: `Quote ${quotationNo}`
    }));
  }, []);

  const handleAutoSave = () => {
    console.log('Auto-saving draft:', quotationData);
    setAutoSaveStatus('Saved ' + new Date().toLocaleTimeString());
    setTimeout(() => setAutoSaveStatus(''), 3000);
  };

  const addNewItem = () => {
    const newItem = {
      ...defaultNewItem,
      id: Date.now()
    };
    
    setQuotationData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setExpandedItems(prev => ({
      ...prev,
      [newItem.id]: true
    }));
  };

  const removeItem = (itemId) => {
    if (showDeleteConfirm === itemId) {
      setQuotationData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
      
      setExpandedItems(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[itemId];
        return newExpanded;
      });
      
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(itemId);
      setTimeout(() => setShowDeleteConfirm(null), 5000);
    }
  };

  const duplicateItem = (itemId) => {
    const itemToDuplicate = quotationData.items.find(item => item.id === itemId);
    if (itemToDuplicate) {
      const duplicatedItem = {
        ...itemToDuplicate,
        id: Date.now(),
        name: `${itemToDuplicate.name} (Copy)`
      };
      
      setQuotationData(prev => ({
        ...prev,
        items: [...prev.items, duplicatedItem]
      }));
    }
  };

  const updateItem = (itemId, field, value) => {
    setQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const addComponentToItem = (itemId) => {
    const newComponent = {
      ...defaultNewComponent,
      id: Date.now()
    };
    
    setQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, components: [...item.components, newComponent] }
          : item
      )
    }));
  };

  const removeComponentFromItem = (itemId, componentId) => {
    setQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, components: item.components.filter(comp => comp.id !== componentId) }
          : item
      )
    }));
  };

  const updateComponent = (itemId, componentId, field, value) => {
    setQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? {
              ...item,
              components: item.components.map(comp => 
                comp.id === componentId ? { ...comp, [field]: value } : comp
              )
            }
          : item
      )
    }));
  };

  const updateCabinetType = (itemId, cabinetType) => {
    const cabinet = cabinetTypes.find(c => c.value === cabinetType);
    const standardDepth = cabinet ? cabinet.standardDepth : null;
    
    updateItem(itemId, 'cabinetType', cabinetType);
    if (standardDepth) {
      updateItem(itemId, 'standardDepth', standardDepth);
      updateItem(itemId, 'width', standardDepth);
    }
  };

  const handleSaveDraft = () => {
    setIsLoading(true);
    console.log('Saving draft:', quotationData);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handlePreviewPDF = () => {
    console.log('Generating PDF preview');
    // TODO: Generate PDF preview
  };

  const handleSaveAndSend = () => {
    if (validateForm(quotationData, setValidationErrors)) {
      setIsLoading(true);
      console.log('Saving and sending:', quotationData);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {isLoading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}
      
      {/* Sticky Action Bar */}
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          p: 2, 
          mb: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <Link 
                color="inherit" 
                href="#" 
                onClick={() => navigate('/quotations')}
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                Quotations
              </Link>
              <Typography color="text.primary">Create New</Typography>
            </Breadcrumbs>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" fontWeight="bold">
                {quotationData.title || 'New Quotation'}
              </Typography>
              <Chip label="Draft" color="default" size="small" />
            </Box>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/quotations')}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreviewPDF}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSaveAndSend}
            >
              Save & Send
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Quote Information Section */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quote Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quote Title"
                  value={quotationData.title}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, title: e.target.value }))}
                  error={hasFieldError(validationErrors, 'title')}
                  helperText={getFieldError(validationErrors, 'title')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quote ID"
                  value={quotationData.quoteId}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, quoteId: e.target.value }))}
                  placeholder="Auto-generated"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Client Information Section */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={quotationData.client}
                  onChange={(event, newValue) => {
                    setQuotationData(prev => ({ ...prev, client: newValue }));
                    validateField('client', newValue, null, setValidationErrors);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Client"
                      error={hasFieldError(validationErrors, 'client')}
                      helperText={getFieldError(validationErrors, 'client')}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Items Section */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Quotation Items ({quotationData.items.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addNewItem}
              >
                Add Item
              </Button>
            </Box>
            
            {quotationData.items.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No items added yet. Click "Add Item" to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {quotationData.items.map((item, index) => (
                  <QuotationItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    expanded={expandedItems[item.id]}
                    onToggleExpansion={() => toggleItemExpansion(item.id)}
                    onUpdate={(field, value) => updateItem(item.id, field, value)}
                    onRemove={() => removeItem(item.id)}
                    onDuplicate={() => duplicateItem(item.id)}
                    onAddComponent={() => addComponentToItem(item.id)}
                    onRemoveComponent={(componentId) => removeComponentFromItem(item.id, componentId)}
                    onUpdateComponent={(componentId, field, value) => updateComponent(item.id, componentId, field, value)}
                    validationErrors={validationErrors}
                    materials={materials}
                    components={components}
                    showDeleteConfirm={showDeleteConfirm === item.id}
                    formatCurrency={formatCurrency}
                    calculateItemCost={calculateItemCost}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <SidebarSummary
            quotationData={quotationData}
            autoSaveStatus={autoSaveStatus}
            formatCurrency={formatCurrency}
            calculateSubtotal={() => calculateSubtotal(quotationData.items, realTimeCalculations)}
            calculateMarkup={() => calculateMarkup(calculateSubtotal(quotationData.items, realTimeCalculations), quotationData.markupPercentage)}
            calculateTax={() => calculateTax(calculateSubtotal(quotationData.items, realTimeCalculations) + calculateMarkup(calculateSubtotal(quotationData.items, realTimeCalculations), quotationData.markupPercentage), quotationData.taxRate)}
            calculateGrandTotal={() => calculateGrandTotal(quotationData.items, quotationData.markupPercentage, quotationData.taxRate, realTimeCalculations)}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateQuotationPage;