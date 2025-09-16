import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  Breadcrumbs,
  Link,
  Container,
  Autocomplete,
  Alert,
  Stack,
  LinearProgress,
  Tooltip,
  Badge,
  CircularProgress,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import constants and utilities
import {
  defaultNewItem,
  defaultNewComponent
} from '../constants/quotationConstants';

import {
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

import { QuotationItemCard } from '../components/quotation/QuotationItemCard';
import { quotationService } from '../services/quotationService';
import { quotationAPI } from '../services/quotationApi';
import { useNotification } from '../contexts/NotificationContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { useQuotationState } from '../hooks/useQuotationState';

const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Enhanced loading and operation states
  const [operationStates, setOperationStates] = useState({
    savingDraft: false,
    savingAndSending: false,
    addingItem: false,
    removingItem: {},
    duplicatingItem: {},
    autoSaving: false
  });

  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: '',
    progress: null,
  });

  // Enhanced feedback and monitoring states
  const [feedbackState, setFeedbackState] = useState({
    saveCount: 0,
    lastSaveTime: null,
    isOnline: navigator.onLine,
    pendingOperations: 0,
    connectionStatus: 'connected'
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  // Enhanced error handling with retry logic
  const handleApiError = useCallback((error, operation = 'operation', canRetry = true) => {
    console.error(`${operation} failed:`, error);
    setLastError({ error, operation, timestamp: Date.now() });
    
    let errorMessage = `Failed to ${operation}`;
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Session expired. Please log in again.';
          setTimeout(() => navigate('/login'), 2000);
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = data.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data.message || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred.';
    }
    
    const options = {
      title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Failed`,
      persistent: !canRetry,
    };
    
    if (canRetry && retryCount < 3) {
      options.action = (
        <Button
          color="inherit"
          size="small"
          onClick={() => handleRetry(operation)}
        >
          Retry ({3 - retryCount} left)
        </Button>
      );
    }
    
    showError(errorMessage, options);
  }, [navigate, showError, retryCount]);

  const handleRetry = useCallback((operation) => {
    setRetryCount(prev => prev + 1);
    
    switch (operation) {
      case 'save draft':
        handleSaveDraft();
        break;
      case 'save and send':
        handleSaveAndSend();
        break;
      case 'auto-save':
        handleAutoSave();
        break;
      default:
        showWarning('Retry not available for this operation.');
    }
  }, []);
  
  // Centralized state management with persistence
  const {
    quotationData,
    updateQuotationData,
    isDirty,
    lastSaved,
    autoSaveStatus,
    scheduleAutoSave,
    markAsSaved,
    clearDraft,
    hasUnsavedChanges
  } = useQuotationState();
  
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [realTimeCalculations, setRealTimeCalculations] = useState({});
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  
  // Use imported mock data
  const [clients, setClients] = useState(mockClients);
  const [materials, setMaterials] = useState(mockMaterials);
  const [components, setComponents] = useState(mockComponents);

  // Add missing calculateItemCost function
  const calculateItemCost = useCallback((item) => {
    if (!item) return 0;
    
    let totalCost = 0;
    
    // Calculate material costs
    if (item.materials && item.materials.length > 0) {
      totalCost += item.materials.reduce((sum, material) => {
        return sum + (material.quantity * material.unitPrice);
      }, 0);
    }
    
    // Calculate component costs
    if (item.components && item.components.length > 0) {
      totalCost += item.components.reduce((sum, component) => {
        return sum + (component.quantity * component.unitPrice);
      }, 0);
    }
    
    // Apply markup
    if (item.markup && item.markup > 0) {
      totalCost *= (1 + item.markup / 100);
    }
    
    return totalCost;
  }, []);

  // Move handleAutoSave outside useEffect
  const handleAutoSave = useCallback(async (data) => {
    if (!data.title && !data.client && data.items.length === 0) {
      return;
    }
    
    try {
      const apiData = transformQuotationDataForAPI(data);
      const result = await quotationService.saveDraft(apiData, currentQuotationId);
      
      if (result.success) {
        if (!currentQuotationId && result.data?.id) {
          setCurrentQuotationId(result.data.id);
        }
        
        // Mark as saved with server data
        markAsSaved({
          id: result.data.id,
          quotationNo: result.data.quotation_no,
          totalCost: result.data.total_cost
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    }
  }, [currentQuotationId, markAsSaved]);

  // Auto-save functionality with the new hook
  useEffect(() => {
    scheduleAutoSave(handleAutoSave);
  }, [quotationData, currentQuotationId, scheduleAutoSave, handleAutoSave]);

  // Initialize quotation number on mount
  useEffect(() => {
    if (!quotationData.title || quotationData.title === '') {
      const quotationNo = generateQuotationNumber();
      updateQuotationData(prev => ({
        ...prev,
        title: `Quote ${quotationNo}`
      }));
    }
  }, []);



  const transformQuotationDataForAPI = (data) => {
    return {
      title: data.title || '',
      description: data.description || '',
      client_id: data.client?.id || null,
      project_name: data.project?.name || '',
      due_date: data.project?.deadline ? new Date(data.project.deadline).toISOString() : null,
      notes: data.notes || '',
      markup: parseFloat(data.markupPercentage) || 0,
      tax_rate: parseFloat(data.taxRate) || 0,
      items: data.items.filter(item => item.componentId && item.quantity > 0).map(item => ({
        component_id: item.componentId,
        length: parseFloat(item.length) || 1,
        width: parseFloat(item.width) || 1,
        height: parseFloat(item.height) || 1,
        quantity: parseInt(item.quantity) || 1,
        notes: item.notes || ''
      })),
      materials: data.materials?.map(material => ({
        material_id: material.materialId || material.id,
        quantity: parseFloat(material.quantity) || 0,
        unit_cost: parseFloat(material.unitCost) || 0
      })) || []
    };
  };

  const validateQuotationData = (data) => {
    const errors = {};
    
    if (!data.title || data.title.trim() === '') {
      errors.title = 'Quotation title is required';
    }
    
    if (!data.items || data.items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      data.items.forEach((item, index) => {
        if (!item.componentId) {
          errors[`item_${index}_component`] = 'Component is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (!item.length || item.length <= 0) {
          errors[`item_${index}_length`] = 'Length must be greater than 0';
        }
        if (!item.width || item.width <= 0) {
          errors[`item_${index}_width`] = 'Width must be greater than 0';
        }
        if (!item.height || item.height <= 0) {
          errors[`item_${index}_height`] = 'Height must be greater than 0';
        }
      });
    }
    
    return errors;
  };

  const handleSaveDraft = async () => {
    if (loadingState.isLoading) return;
    
    try {
      setLoadingState({
        isLoading: true,
        message: 'Saving draft...',
        progress: null,
      });
      
      const apiData = transformQuotationDataForAPI(quotationData);
      const result = await quotationService.saveDraft(apiData, currentQuotationId);
      
      if (result.success) {
        setCurrentQuotationId(result.data.id);
        setRetryCount(0);
        
        // Mark as saved with server data
        markAsSaved({
          id: result.data.id,
          quotationNo: result.data.quotation_no,
          totalCost: result.data.total_cost
        });
        
        showSuccess('Draft saved successfully!', {
          title: 'Save Successful',
        });
      } else {
        throw new Error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      handleApiError(error, 'save draft', true);
    } finally {
      setLoadingState({ isLoading: false, message: '', progress: null });
    }
  };

  // Add the missing handleSaveAndSend function
  const handleSaveAndSend = async () => {
    if (loadingState.isLoading) return;
    
    const errors = validateQuotationData(quotationData);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showWarning('Please fix validation errors before saving', {
        title: 'Validation Required',
      });
      setActiveTab(0);
      return;
    }
    
    try {
      setLoadingState({
        isLoading: true,
        message: 'Creating quotation...',
        progress: 0,
      });
      
      const apiData = transformQuotationDataForAPI(quotationData);
      
      setLoadingState(prev => ({ ...prev, progress: 25 }));
      
      let result;
      if (currentQuotationId) {
        result = await quotationService.updateQuotation(currentQuotationId, apiData);
        setLoadingState(prev => ({ ...prev, progress: 50 }));
        
        if (result.success) {
          await quotationService.updateQuotationStatus(currentQuotationId, 'issued');
          setLoadingState(prev => ({ ...prev, progress: 75 }));
        }
      } else {
        result = await quotationService.createQuotation({ ...apiData, status: 'issued' });
        setLoadingState(prev => ({ ...prev, progress: 75 }));
      }
      
      if (result.success) {
        setRetryCount(0);
        
        // Clear draft data since quotation is now saved
        clearDraft();
        
        try {
          setLoadingState(prev => ({ ...prev, message: 'Generating PDF...' }));
          await quotationService.generateQuotationPDF(result.data.id);
          setLoadingState(prev => ({ ...prev, progress: 100 }));
          
          showInfo('PDF generated successfully!');
        } catch (pdfError) {
          console.warn('PDF generation failed:', pdfError);
          showWarning('Quotation created but PDF generation failed.');
        }
        
        showSuccess('Quotation created and ready to send!', {
          title: 'Success',
        });
        
        setTimeout(() => {
          navigate(`/quotations/${result.data.id}`);
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to create quotation');
      }
    } catch (error) {
      handleApiError(error, 'save and send', true);
    } finally {
      setLoadingState({ isLoading: false, message: '', progress: null });
    }
  };

  const addNewItem = () => {
    const newItem = {
      ...defaultNewItem,
      id: Date.now().toString()
    };
    
    updateQuotationData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setExpandedItems(prev => ({
      ...prev,
      [newItem.id]: true
    }));
  };

  const removeItem = (itemId) => {
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    
    setExpandedItems(prev => {
      const newExpanded = { ...prev };
      delete newExpanded[itemId];
      return newExpanded;
    });
    
    setShowDeleteConfirm(null);
  };

  const updateItem = (itemId, field, value) => {
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
    
    // Clear validation error for this field
    const errorKey = `item_${itemId}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const duplicateItem = (itemId) => {
    updateQuotationData(prev => {
      const itemToDuplicate = prev.items.find(item => item.id === itemId);
      if (itemToDuplicate) {
        const duplicatedItem = {
          ...itemToDuplicate,
          id: Date.now().toString(),
          title: `${itemToDuplicate.title} (Copy)`
        };
        return {
          ...prev,
          items: [...prev.items, duplicatedItem]
        };
      }
      return prev;
    });
  };

  const addNewComponent = (itemId) => {
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              components: [...item.components, { ...defaultNewComponent, id: Date.now().toString() }] 
            }
          : item
      )
    }));
  };

  const updateComponent = (itemId, componentId, updates) => {
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? {
              ...item,
              components: item.components.map(comp => 
                comp.id === componentId ? { ...comp, ...updates } : comp
              )
            }
          : item
      )
    }));
  };

  const addComponentToItem = (itemId) => {
    const newComponent = {
      ...defaultNewComponent,
      id: Date.now()
    };
    
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, components: [...(item.components || []), newComponent] }
          : item
      )
    }));
  };

  const removeComponentFromItem = (itemId, componentId) => {
    updateQuotationData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, components: (item.components || []).filter(comp => comp.id !== componentId) }
          : item
      )
    }));
  };

  const handlePreviewPDF = () => {
    console.log('Generating PDF preview for quotation:', currentQuotationId);
    // TODO: Implement PDF preview functionality
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <LoadingOverlay 
        open={loadingState.isLoading}
        message={loadingState.message}
        progress={loadingState.progress}
        variant={loadingState.progress !== null ? 'linear' : 'circular'}
      />
      
      {/* Unsaved changes indicator */}
      {isDirty && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleSaveDraft}
              disabled={loadingState.isLoading}
            >
              Save Draft
            </Button>
          }
        >
          You have unsaved changes. {autoSaveStatus && `(${autoSaveStatus})`}
        </Alert>
      )}
      
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
              <Typography color="text.primary">
                {currentQuotationId ? 'Edit' : 'Create New'}
              </Typography>
            </Breadcrumbs>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" fontWeight="bold">
                {quotationData.title || 'New Quotation'}
              </Typography>
              <Chip label="Draft" color="default" size="small" />
              {autoSaveStatus && (
                <Chip 
                  label={autoSaveStatus} 
                  color={autoSaveStatus.includes('failed') ? 'error' : 'success'} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/quotations')}
              disabled={loadingState.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={loadingState.isLoading}
            >
              {loadingState.isLoading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreviewPDF}
              disabled={!currentQuotationId || loadingState.isLoading}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSaveAndSend}
              disabled={!currentQuotationId || loadingState.isLoading}
              sx={{ mr: 1 }}
            >
              {loadingState.isLoading ? 'Saving...' : 'Save & Send'}
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
                  onChange={(e) => updateQuotationData(prev => ({ ...prev, title: e.target.value }))}
                  error={hasFieldError(validationErrors, 'title')}
                  helperText={getFieldError(validationErrors, 'title')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quote ID"
                  value={quotationData.quoteId}
                  onChange={(e) => updateQuotationData(prev => ({ ...prev, quoteId: e.target.value }))}
                  // Removed duplicate fullWidth prop since it appears later in the code
                  required
                  error={hasFieldError(validationErrors, 'quoteId')}
                  helperText={getFieldError(validationErrors, 'quoteId')}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Client Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>
              <TextField
                fullWidth
                label="Client Name (Optional)"
                value={quotationData.clientName || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 255); // Limit to 255 characters
                  updateQuotationData(prev => ({ ...prev, clientName: value }));
                }}
                placeholder="Enter client name or company"
                helperText="Optional field for client identification"
              />
            </CardContent>
          </Card>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.name}
                value={quotationData.client}
                onChange={(event, newValue) => {
                  updateQuotationData(prev => ({ ...prev, client: newValue }));
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
                    onUpdateComponent={(componentId, updates) => updateComponent(item.id, componentId, updates)}
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