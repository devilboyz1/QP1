// Validation utilities for quotation forms

export const validateField = (field, value, itemIndex = null, validationErrors = {}) => {
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
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[fieldKey] = 'Please enter a valid email address';
      } else {
        delete errors[fieldKey];
      }
      break;
    case 'phone':
      if (value && !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-()]/g, ''))) {
        errors[fieldKey] = 'Please enter a valid phone number';
      } else {
        delete errors[fieldKey];
      }
      break;
    default:
      break;
  }
  
  return { errors, isValid: !errors[fieldKey] };
};

export const validateForm = (quotationData) => {
  let isValid = true;
  let errors = {};
  
  // Validate client
  const clientValidation = validateField('client', quotationData.client, null, errors);
  errors = clientValidation.errors;
  if (!clientValidation.isValid) isValid = false;
  
  // Validate email if provided
  if (quotationData.email) {
    const emailValidation = validateField('email', quotationData.email, null, errors);
    errors = emailValidation.errors;
    if (!emailValidation.isValid) isValid = false;
  }
  
  // Validate phone if provided
  if (quotationData.phone) {
    const phoneValidation = validateField('phone', quotationData.phone, null, errors);
    errors = phoneValidation.errors;
    if (!phoneValidation.isValid) isValid = false;
  }
  
  // Validate items
  quotationData.items.forEach((item, index) => {
    const nameValidation = validateField('name', item.name, index, errors);
    errors = nameValidation.errors;
    if (!nameValidation.isValid) isValid = false;
    
    const lengthValidation = validateField('length', item.length, index, errors);
    errors = lengthValidation.errors;
    if (!lengthValidation.isValid) isValid = false;
    
    const widthValidation = validateField('width', item.width, index, errors);
    errors = widthValidation.errors;
    if (!widthValidation.isValid) isValid = false;
    
    const quantityValidation = validateField('quantity', item.quantity, index, errors);
    errors = quantityValidation.errors;
    if (!quantityValidation.isValid) isValid = false;
  });
  
  return { isValid, errors };
};

export const getFieldError = (validationErrors, field, itemIndex = null) => {
  const fieldKey = itemIndex !== null ? `item_${itemIndex}_${field}` : field;
  return validationErrors[fieldKey] || '';
};

export const hasFieldError = (validationErrors, field, itemIndex = null) => {
  return !!getFieldError(validationErrors, field, itemIndex);
};

// Removed the malformed commented function declaration that was causing syntax errors
// The original validateField function at the top of the file is the correct implementation