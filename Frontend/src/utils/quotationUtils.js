// Calculation utilities for quotations

export const calculateLinearFeet = (item) => {
  if (item.pricingMethod === 'linear-foot') {
    return item.length * item.quantity;
  }
  return 0;
};

export const calculateDisplayValue = (item, pricingMethods) => {
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

export const calculateItemCostBreakdown = (item) => {
  let materialCost = 0;
  let componentsCost = 0;
  
  if (item.pricingMethod === 'linear-foot') {
    const linearFeet = calculateLinearFeet(item);
    if (item.baseMaterial) {
      materialCost = linearFeet * item.baseMaterial.cost;
    }
  } else if (item.pricingMethod === 'per-piece') {
    if (item.baseMaterial) {
      materialCost = item.quantity * item.baseMaterial.cost;
    }
  }
  
  // Calculate component costs
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

export const calculateItemCost = (item) => {
  const breakdown = calculateItemCostBreakdown(item);
  return breakdown.totalCost;
};

export const calculateSubtotal = (items, realTimeCalculations = {}) => {
  return items.reduce((total, item) => {
    const calc = realTimeCalculations[item.id] || calculateItemCostBreakdown(item);
    return total + calc.totalCost;
  }, 0);
};

export const calculateMarkup = (subtotal, markupPercentage) => {
  return subtotal * (markupPercentage / 100);
};

export const calculateTax = (subtotal, markup, taxRate) => {
  return (subtotal + markup) * (taxRate / 100);
};

export const calculateGrandTotal = (subtotal, markup, tax) => {
  return subtotal + markup + tax;
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

export const generateQuotationNumber = () => {
  return `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
};