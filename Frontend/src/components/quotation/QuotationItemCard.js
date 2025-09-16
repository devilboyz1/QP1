import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Button,
  Chip,
  Stack,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export const QuotationItemCard = ({
  item,
  index,
  expanded,
  onToggleExpansion,
  onUpdate,
  onRemove,
  onDuplicate,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  validationErrors,
  materials,
  components,
  showDeleteConfirm,
  formatCurrency,
  calculateItemCost
}) => {
  const getFieldError = (field) => {
    return validationErrors[`item_${index}_${field}`];
  };

  const hasFieldError = (field) => {
    return !!getFieldError(field);
  };

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">
              {item.name || `Item ${index + 1}`}
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
            <IconButton onClick={onDuplicate} size="small">
              <CopyIcon />
            </IconButton>
            <IconButton 
              onClick={onRemove} 
              size="small"
              color={showDeleteConfirm ? "error" : "default"}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={onToggleExpansion}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        }
      />
      
      <Collapse in={expanded}>
        <CardContent>
          {showDeleteConfirm && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>Click delete again to confirm removal</Typography>
                <Button size="small" onClick={() => onRemove(item.id)}>
                  Confirm Delete
                </Button>
              </Box>
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={item.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                error={hasFieldError('name')}
                helperText={getFieldError('name')}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Length"
                type="number"
                value={item.length}
                onChange={(e) => onUpdate('length', parseFloat(e.target.value) || 0)}
                error={hasFieldError('length')}
                helperText={getFieldError('length')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{item.unit}</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Width"
                type="number"
                value={item.width}
                onChange={(e) => onUpdate('width', parseFloat(e.target.value) || 0)}
                error={hasFieldError('width')}
                helperText={getFieldError('width')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{item.unit}</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Height"
                type="number"
                value={item.height}
                onChange={(e) => onUpdate('height', parseFloat(e.target.value) || 0)}
                error={hasFieldError('height')}
                helperText={getFieldError('height')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{item.unit}</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdate('quantity', parseInt(e.target.value) || 1)}
                error={hasFieldError('quantity')}
                helperText={getFieldError('quantity')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Base Material</InputLabel>
                <Select
                  value={item.baseMaterial?.id || ''}
                  onChange={(e) => {
                    const material = materials.find(m => m.id === e.target.value);
                    onUpdate('baseMaterial', material);
                  }}
                >
                  {materials.map((material) => (
                    <MenuItem key={material.id} value={material.id}>
                      {material.name} - {formatCurrency(material.cost)}/{material.unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Labour Rate"
                type="number"
                value={item.labourRate}
                onChange={(e) => onUpdate('labourRate', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={item.notes}
                onChange={(e) => onUpdate('notes', e.target.value)}
              />
            </Grid>
          </Grid>
          
          {/* Components Section */}
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Components</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={onAddComponent}
              >
                Add Component
              </Button>
            </Box>
            
            {item.components && item.components.length > 0 ? (
              <Stack spacing={2}>
                {item.components.map((component) => (
                  <Card key={component.id} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Component Name"
                            value={component.name}
                            onChange={(e) => onUpdateComponent(component.id, 'name', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={component.quantity}
                            onChange={(e) => onUpdateComponent(component.id, 'quantity', parseInt(e.target.value) || 1)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <TextField
                            fullWidth
                            label="Length"
                            type="number"
                            value={component.length}
                            onChange={(e) => onUpdateComponent(component.id, 'length', parseFloat(e.target.value) || 0)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Material</InputLabel>
                            <Select
                              value={component.material?.id || ''}
                              onChange={(e) => {
                                const material = materials.find(m => m.id === e.target.value);
                                onUpdateComponent(component.id, 'material', material);
                              }}
                            >
                              {materials.map((material) => (
                                <MenuItem key={material.id} value={material.id}>
                                  {material.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <IconButton 
                            onClick={() => onRemoveComponent(component.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No components added yet
              </Typography>
            )}
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};