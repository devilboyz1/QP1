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
  Badge
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
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [realTimeCalculations, setRealTimeCalculations] = useState({});
  
  const [quotationData, setQuotationData] = useState({
    title: '',
    client: null,
    projectAddress: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    currency: 'USD',
    taxRate: 10,
    salesperson: '',
    notes: '',
    items: [],
    markupPercentage: 20,
    defaultPricingMethod: 'linear-foot',
    measurementUnit: 'ft'
  });

  const [expandedItems, setExpandedItems] = useState({});
  const [clients, setClients] = useState([
    { id: 1, name: 'ABC Corporation', email: 'contact@abc.com' },
    { id: 2, name: 'XYZ Ltd', email: 'info@xyz.com' },
    { id: 3, name: 'Home Renovations Inc', email: 'hello@homereno.com' }
  ]);

  const [materials, setMaterials] = useState([
    { id: 1, name: 'Oak Wood', unit: 'sqm', cost: 45.00, thickness: '18mm' },
    { id: 2, name: 'Pine Wood', unit: 'sqm', cost: 25.00, thickness: '18mm' },
    { id: 3, name: 'MDF Board', unit: 'sqm', cost: 15.00, thickness: '18mm' },
    { id: 4, name: 'Plywood', unit: 'sqm', cost: 35.00, thickness: '18mm' },
    { id: 5, name: 'Glass Panel', unit: 'sqm', cost: 80.00, thickness: '6mm' }
  ]);

  const [components, setComponents] = useState([
    { id: 1, name: 'Cabinet Door', category: 'Door' },
    { id: 2, name: 'Drawer Box', category: 'Drawer' },
    { id: 3, name: 'Shelf', category: 'Storage' },
    { id: 4, name: 'Table Top', category: 'Surface' },
    { id: 5, name: 'Side Panel', category: 'Panel' }
  ]);

  const unitTypes = ['mm', 'cm', 'm', 'inch', 'ft'];
  
  // 更新定价方法以支持线性英尺为主的定价
  const pricingMethods = [
    { value: 'linear-foot', label: 'Linear Foot (尺走)', unit: 'lf', primary: true },
    { value: 'per-piece', label: 'Per Piece', unit: 'pcs' },
    { value: 'area', label: 'Area (sqm)', unit: 'sqm' },
    { value: 'volume', label: 'Volume (m³)', unit: 'm³' }
  ];
  
  const costingMethods = ['linear-foot', 'per-piece', 'area', 'volume'];
  
  // 添加橱柜类型和标准化深度
  const cabinetTypes = [
    { value: 'base', label: 'Base Cabinet', standardDepth: 2, unit: 'ft' },
    { value: 'wall', label: 'Wall Cabinet', standardDepth: 1, unit: 'ft' },
    { value: 'tall', label: 'Tall Cabinet', standardDepth: 2, unit: 'ft' },
    { value: 'custom', label: 'Custom', standardDepth: null, unit: 'ft' }
  ];
  
  // 组件类型定义
  const componentTypes = [
    { value: 'drawer', label: 'Drawer', pricingType: 'per-piece' },
    { value: 'glass-door', label: 'Glass Door', pricingType: 'per-piece' },
    { value: 'countertop', label: 'Countertop', pricingType: 'linear-foot' },
    { value: 'crown-molding', label: 'Crown Molding', pricingType: 'linear-foot' },
    { value: 'hardware', label: 'Hardware', pricingType: 'per-piece' }
  ];

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
    const quotationNo = `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    setQuotationData(prev => ({
      ...prev,
      title: `Quote ${quotationNo}`
    }));
  }, []);

  // Validation functions
  const validateField = (field, value, itemIndex = null) => {
    const errors = { ...validationErrors };
    const fieldKey = itemIndex !== null ? `item_${itemIndex}_${field}` : field;
    
    switch (field) {
      case 'client':
        if (!value) {
          errors[fieldKey] = 'Client selection is required';
        } else {
          delete errors[fieldKey];
        }
        break;
      case 'name':
        if (!value || value.trim() === '') {
          errors[fieldKey] = 'Item name is required';
        } else {
          delete errors[fieldKey];
        }
        break;
      case 'length':
      case 'width':
      case 'height':
        if (value <= 0) {
          errors[fieldKey] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be greater than 0`;
        } else {
          delete errors[fieldKey];
        }
        break;
      case 'quantity':
        if (value <= 0) {
          errors[fieldKey] = 'Quantity must be at least 1';
        } else {
          delete errors[fieldKey];
        }
        break;
      case 'labourRate':
        if (value < 0) {
          errors[fieldKey] = 'Labour rate cannot be negative';
        } else {
          delete errors[fieldKey];
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
    return !errors[fieldKey];
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate client
    if (!validateField('client', quotationData.client)) {
      isValid = false;
    }
    
    // Validate items
    quotationData.items.forEach((item, index) => {
      if (!validateField('name', item.name, index)) isValid = false;
      if (!validateField('length', item.length, index)) isValid = false;
      if (!validateField('width', item.width, index)) isValid = false;
      if (!validateField('quantity', item.quantity, index)) isValid = false;
    });
    
    return isValid;
  };

  const handleAutoSave = () => {
    console.log('Auto-saving draft:', quotationData);
    setAutoSaveStatus('Saved ' + new Date().toLocaleTimeString());
    setTimeout(() => setAutoSaveStatus(''), 3000);
  };

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      length: 0,
      height: 0,
      width: 0,
      unit: 'ft',
      cabinetType: 'base',
      pricingMethod: 'linear-foot',
      costingMethod: 'linear-foot',
      standardDepth: 2,
      useStandardDepth: true,
      baseMaterial: null,
      hardwareCost: 0,
      labourHours: 0,
      labourRate: 50,
      components: [],
      notes: '',
      linearFeet: 0,
      materialCost: 0,
      totalCost: 0
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
      id: Date.now(),
      name: '',
      quantity: 1,
      length: 0,
      width: 0,
      height: 0,
      material: null,
      notes: ''
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

  const calculateDisplayValue = (item) => {
    const method = pricingMethods.find(m => m.value === item.costingMethod);
    if (!method) return '';
    
    let value = 0;
    switch (item.costingMethod) {
      case 'area':
        value = (item.length * item.width) / 1000000; // Convert mm² to m²
        break;
      case 'linear':
        value = item.length / 1000; // Convert mm to m
        break;
      case 'volume':
        value = (item.length * item.width * item.height) / 1000000000; // Convert mm³ to m³
        break;
      case 'per-unit':
        value = item.quantity;
        break;
      default:
        value = 0;
    }
    
    return `${value.toFixed(2)} ${method.unit}`;
  };

  const calculateLinearFeet = (item) => {
    if (item.pricingMethod === 'linear-foot') {
      return item.length * item.quantity;
    }
    return 0;
  };
  
  const updateCabinetType = (itemId, cabinetType) => {
    const cabinet = cabinetTypes.find(c => c.value === cabinetType);
    const standardDepth = cabinet ? cabinet.standardDepth : null;
    
    updateItem(itemId, 'cabinetType', cabinetType);
    if (standardDepth) {
      updateItem(itemId, 'standardDepth', standardDepth);
      updateItem(itemId, 'width', standardDepth); // 自动设置宽度为标准深度
    }
  };
  
  const calculateItemCostBreakdown = (item) => {
    let materialCost = 0;
    let componentsCost = 0;
    
    if (item.pricingMethod === 'linear-foot') {
      const linearFeet = calculateLinearFeet(item);
      if (item.baseMaterial) {
        // 假设材料成本按线性英尺计算
        materialCost = linearFeet * item.baseMaterial.cost;
      }
    } else if (item.pricingMethod === 'per-piece') {
      if (item.baseMaterial) {
        materialCost = item.quantity * item.baseMaterial.cost;
      }
    }
    
    // 计算组件成本
    item.components.forEach(component => {
      if (component.pricingType === 'linear-foot') {
        componentsCost += component.length * component.quantity * (component.material?.cost || 0);
      } else {
        componentsCost += component.quantity * (component.material?.cost || 0);
      }
    });
    
    const labourCost = item.labourHours * item.labourRate;
    const totalCost = materialCost + componentsCost + item.hardwareCost + labourCost;
    
    return {
      materialCost,
      componentsCost,
      labourCost,
      hardwareCost: item.hardwareCost,
      totalCost
    };
  };

  // Add the missing calculateItemCost function
  const calculateItemCost = (item) => {
    const breakdown = calculateItemCostBreakdown(item);
    return breakdown.totalCost;
  };

  const calculateSubtotal = () => {
    return quotationData.items.reduce((total, item) => {
      const calc = realTimeCalculations[item.id] || calculateItemCostBreakdown(item);
      return total + calc.totalCost;
    }, 0);
  };

  const calculateMarkup = () => {
    return calculateSubtotal() * (quotationData.markupPercentage / 100);
  };

  const calculateTax = () => {
    return (calculateSubtotal() + calculateMarkup()) * (quotationData.taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateMarkup() + calculateTax();
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
    if (validateForm()) {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotationData.currency
    }).format(amount || 0);
  };

  // Sidebar Summary Component
  const SidebarSummary = () => (
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
              Preview PDF
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
        {/* Left Column - Main Form */}
        <Grid item xs={12} lg={8}>
          {/* Quotation Header */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quotation Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quotation Title"
                  value={quotationData.title}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, title: e.target.value }))}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => option.name}
                  value={quotationData.client}
                  onChange={(event, newValue) => {
                    setQuotationData(prev => ({ ...prev, client: newValue }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Client" variant="outlined" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Address / Site"
                  value={quotationData.projectAddress}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, projectAddress: e.target.value }))}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={quotationData.date}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, date: e.target.value }))}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={quotationData.expiryDate}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={quotationData.currency}
                    onChange={(e) => setQuotationData(prev => ({ ...prev, currency: e.target.value }))}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="AUD">AUD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={quotationData.taxRate}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salesperson / Prepared by"
                  value={quotationData.salesperson}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, salesperson: e.target.value }))}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes / Job Description"
                  value={quotationData.notes}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, notes: e.target.value }))}
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Items List */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Items ({quotationData.items.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addNewItem}
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {quotationData.items.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                py={4}
                sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}
              >
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No items added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Start by adding your first cabinet or furniture item
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addNewItem}
                >
                  Add First Item
                </Button>
              </Box>
            ) : (
              quotationData.items.map((item, index) => (
                <Card key={item.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.name || `Item ${index + 1}`} ({item.quantity})
                        </Typography>
                        <Chip 
                          label={formatCurrency(calculateItemCost(item))} 
                          color="primary" 
                          size="small" 
                        />
                      </Box>
                    }
                    action={
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => duplicateItem(item.id)}
                          title="Duplicate Item"
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.id)}
                          title="Remove Item"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => toggleItemExpansion(item.id)}
                        >
                          {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  
                  <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
                    <CardContent sx={{ pt: 0 }}>
                      <Grid container spacing={2}>
                        {/* Item Basic Info */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Item Name"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Location / Position"
                            value={item.location}
                            onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        
                        {/* Measurements */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Measurements
                          </Typography>
                        </Grid>
                        
                        {/* Cabinet Type Selection */}
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Cabinet Type</InputLabel>
                            <Select
                              value={item.cabinetType}
                              onChange={(e) => updateCabinetType(item.id, e.target.value)}
                              label="Cabinet Type"
                            >
                              {cabinetTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label} {type.standardDepth && `(${type.standardDepth}ft depth)`}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        {/* Primary Length */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Length (Primary)"
                            type="number"
                            value={item.length}
                            onChange={(e) => updateItem(item.id, 'length', parseFloat(e.target.value) || 0)}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">ft</InputAdornment>
                            }}
                            helperText="Primary charging dimension"
                          />
                        </Grid>
                        
                        {/* Height */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Height"
                            type="number"
                            value={item.height}
                            onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value) || 0)}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">ft</InputAdornment>
                            }}
                          />
                        </Grid>
                        
                        {/* Depth/Width based on cabinet type */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label={item.useStandardDepth ? `Depth (Standard: ${item.standardDepth}ft)` : "Custom Depth"}
                            type="number"
                            value={item.useStandardDepth ? item.standardDepth : item.width}
                            onChange={(e) => {
                              if (!item.useStandardDepth) {
                                updateItem(item.id, 'width', parseFloat(e.target.value) || 0);
                              }
                            }}
                            disabled={item.useStandardDepth}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">ft</InputAdornment>
                            }}
                            helperText={item.useStandardDepth ? "Using standard depth" : "Custom depth"}
                          />
                        </Grid>
                        
                        {/* Pricing Method */}
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Pricing Method</InputLabel>
                            <Select
                              value={item.pricingMethod}
                              onChange={(e) => updateItem(item.id, 'pricingMethod', e.target.value)}
                              label="Pricing Method"
                            >
                              {pricingMethods.map(method => (
                                <MenuItem key={method.value} value={method.value}>
                                  {method.label} {method.primary && '(Primary)'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        {/* Linear Feet Display */}
                        {item.pricingMethod === 'linear-foot' && (
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              label="Linear Feet"
                              value={calculateLinearFeet(item).toFixed(2)}
                              disabled
                              InputProps={{
                                endAdornment: <InputAdornment position="end">lf</InputAdornment>
                              }}
                              helperText="Calculated: Length × Quantity"
                            />
                          </Grid>
                        )}
                        
                        {/* Material Selection */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Material & Costs
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            options={materials}
                            getOptionLabel={(option) => `${option.name} (${option.thickness}) - ${formatCurrency(option.cost)}/${option.unit}`}
                            value={item.material}
                            onChange={(event, newValue) => {
                              updateItem(item.id, 'material', newValue);
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label="Base Material" variant="outlined" size="small" />
                            )}
                          />
                        </Grid>
                        
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Hardware Cost"
                            type="number"
                            value={item.hardware}
                            onChange={(e) => updateItem(item.id, 'hardware', parseFloat(e.target.value) || 0)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">{quotationData.currency}</InputAdornment>
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Labour Hours"
                            type="number"
                            value={item.labourHours}
                            onChange={(e) => updateItem(item.id, 'labourHours', parseFloat(e.target.value) || 0)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">hrs</InputAdornment>
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <Box 
                            sx={{ 
                              p: 1, 
                              backgroundColor: 'primary.50', 
                              borderRadius: 1, 
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'primary.200'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Item Total
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              {formatCurrency(calculateItemCost(item))}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* Components Section */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Components ({item.components.length})
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => addComponentToItem(item.id)}
                            >
                              Add Component
                            </Button>
                          </Box>
                          
                          {item.components.map((component, compIndex) => (
                            <Box key={component.id} sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    fullWidth
                                    label="Component Name"
                                    value={component.name}
                                    onChange={(e) => updateComponent(item.id, component.id, 'name', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>
                                
                                <Grid item xs={6} md={1}>
                                  <TextField
                                    fullWidth
                                    label="Qty"
                                    type="number"
                                    value={component.quantity}
                                    onChange={(e) => updateComponent(item.id, component.id, 'quantity', parseInt(e.target.value) || 1)}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>
                                
                                <Grid item xs={6} md={1}>
                                  <TextField
                                    fullWidth
                                    label="L"
                                    type="number"
                                    value={component.length}
                                    onChange={(e) => updateComponent(item.id, component.id, 'length', parseFloat(e.target.value) || 0)}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>
                                
                                <Grid item xs={6} md={1}>
                                  <TextField
                                    fullWidth
                                    label="W"
                                    type="number"
                                    value={component.width}
                                    onChange={(e) => updateComponent(item.id, component.id, 'width', parseFloat(e.target.value) || 0)}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>
                                
                                <Grid item xs={6} md={1}>
                                  <TextField
                                    fullWidth
                                    label="H"
                                    type="number"
                                    value={component.height}
                                    onChange={(e) => updateComponent(item.id, component.id, 'height', parseFloat(e.target.value) || 0)}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                  <Autocomplete
                                    options={materials}
                                    getOptionLabel={(option) => `${option.name} (${option.thickness})`}
                                    value={component.material}
                                    onChange={(event, newValue) => {
                                      updateComponent(item.id, component.id, 'material', newValue);
                                    }}
                                    renderInput={(params) => (
                                      <TextField {...params} label="Material" variant="outlined" size="small" />
                                    )}
                                  />
                                </Grid>
                                
                                <Grid item xs={12} md={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeComponentFromItem(item.id, component.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Grid>
                        
                        {/* Notes */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Item Notes"
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              ))
            )}
          </Paper>

          {/* Summary Section */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Cost Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Markup Percentage"
                  type="number"
                  value={quotationData.markupPercentage}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, markupPercentage: parseFloat(e.target.value) || 0 }))}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: 'success.50', borderRadius: 1 }}>
                  <Typography variant="h5" fontWeight="bold" color="success.main" textAlign="center">
                    Grand Total: {formatCurrency(calculateGrandTotal())}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column - Floating Panel */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              position: 'sticky', 
              top: 120, 
              p: 2
            }}
          >
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="Cost Summary" />
              <Tab label="Materials" />
              <Tab label="PDF Preview" />
            </Tabs>
            
            {/* Cost Summary Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Live Cost Breakdown
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Subtotal</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(calculateSubtotal())}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Markup ({quotationData.markupPercentage}%)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(calculateMarkup())}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tax ({quotationData.taxRate}%)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(calculateTax())}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: 'primary.50' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Grand Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}>
                          {formatCurrency(calculateGrandTotal())}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Items Breakdown
                </Typography>
                
                {quotationData.items.map((item, index) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2" noWrap>
                      {item.name || `Item ${index + 1}`} (×{item.quantity})
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(calculateItemCost(item))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Quick Materials Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Material Pick
                </Typography>
                
                {materials.map(material => (
                  <Box key={material.id} sx={{ mb: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {material.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {material.thickness} - {formatCurrency(material.cost)}/{material.unit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* PDF Preview Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  PDF Preview
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  PDF preview will be available after saving the quotation.
                </Alert>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreviewPDF}
                  disabled={quotationData.items.length === 0}
                >
                  Generate Preview
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateQuotationPage;