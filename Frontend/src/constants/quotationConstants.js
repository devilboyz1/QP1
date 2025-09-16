export const unitTypes = ['mm', 'cm', 'm', 'inch', 'ft'];

export const pricingMethods = [
  { value: 'linear-foot', label: 'Linear Foot (尺走)', unit: 'lf', primary: true },
  { value: 'per-piece', label: 'Per Piece', unit: 'pcs' },
  { value: 'area', label: 'Area (sqm)', unit: 'sqm' },
  { value: 'volume', label: 'Volume (m³)', unit: 'm³' }
];

export const costingMethods = ['linear-foot', 'per-piece', 'area', 'volume'];

export const cabinetTypes = [
  { value: 'base', label: 'Base Cabinet', standardDepth: 2, unit: 'ft' },
  { value: 'wall', label: 'Wall Cabinet', standardDepth: 1, unit: 'ft' },
  { value: 'tall', label: 'Tall Cabinet', standardDepth: 2, unit: 'ft' },
  { value: 'custom', label: 'Custom', standardDepth: null, unit: 'ft' }
];

export const componentTypes = [
  { value: 'drawer', label: 'Drawer', pricingType: 'per-piece' },
  { value: 'glass-door', label: 'Glass Door', pricingType: 'per-piece' },
  { value: 'countertop', label: 'Countertop', pricingType: 'linear-foot' },
  { value: 'crown-molding', label: 'Crown Molding', pricingType: 'linear-foot' },
  { value: 'hardware', label: 'Hardware', pricingType: 'per-piece' }
];

export const customerTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' }
];

export const projectTypes = [
  { value: 'kitchen', label: 'Kitchen Renovation' },
  { value: 'bathroom', label: 'Bathroom Cabinets' },
  { value: 'office', label: 'Office Furniture' },
  { value: 'bedroom', label: 'Bedroom Storage' },
  { value: 'living-room', label: 'Living Room Built-ins' },
  { value: 'laundry', label: 'Laundry Room' },
  { value: 'garage', label: 'Garage Storage' },
  { value: 'custom', label: 'Custom Project' }
];

export const currencies = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
];

export const salesRepresentatives = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'mike-johnson', label: 'Mike Johnson' },
  { value: 'sarah-wilson', label: 'Sarah Wilson' }
];

export const initialQuotationData = {
  clientName: '',
  title: '',
  description: '',
  items: []
};

export const defaultQuotationData = {
  // Quote Identification
  quoteId: '',
  title: '',
  
  // Customer Information
  client: null,
  customerType: 'individual',
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  
  // Addresses
  mailingAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  },
  
  // Project Information
  projectAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    sameAsMailingAddress: false
  },
  projectType: '',
  clientReferenceCode: '',
  
  // Quote Administration
  issueDate: new Date().toISOString().split('T')[0],
  expirationDate: '',
  currency: 'USD',
  taxRate: 0,
  salesRepresentative: '',
  jobDescription: '',
  
  // Legacy fields
  items: [],
  markupPercentage: 20,
  defaultPricingMethod: 'linear-foot',
  measurementUnit: 'ft'
};

export const defaultNewItem = {
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

export const defaultNewComponent = {
  name: '',
  quantity: 1,
  length: 0,
  width: 0,
  height: 0,
  material: null,
  notes: ''
};

export const validationRules = {
  required: ['title'],
  // Remove 'client' from required fields
  positive: ['length', 'width', 'height', 'quantity'],
  nonNegative: ['labourRate', 'hardwareCost']
};