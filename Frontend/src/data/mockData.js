// Mock data for development and testing

export const mockClients = [
  { id: 1, name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1-555-0123' },
  { id: 2, name: 'XYZ Industries', email: 'info@xyz.com', phone: '+1-555-0456' },
  { id: 3, name: 'Tech Solutions Ltd', email: 'hello@techsolutions.com', phone: '+1-555-0789' },
  { id: 4, name: 'Global Enterprises', email: 'support@global.com', phone: '+1-555-0321' }
];

export const mockMaterials = [
  { id: 1, name: 'Steel Sheet', unitPrice: 25.50, unit: 'sq ft', category: 'Metal' },
  { id: 2, name: 'Aluminum Bar', unitPrice: 15.75, unit: 'linear ft', category: 'Metal' },
  { id: 3, name: 'Wood Plank', unitPrice: 8.25, unit: 'linear ft', category: 'Wood' },
  { id: 4, name: 'Plastic Sheet', unitPrice: 12.00, unit: 'sq ft', category: 'Plastic' },
  { id: 5, name: 'Glass Panel', unitPrice: 35.00, unit: 'sq ft', category: 'Glass' }
];

export const mockComponents = [
  { id: 1, name: 'Standard Door', basePrice: 150.00, category: 'Doors', materials: [1, 3] },
  { id: 2, name: 'Window Frame', basePrice: 85.00, category: 'Windows', materials: [2, 5] },
  { id: 3, name: 'Cabinet Door', basePrice: 45.00, category: 'Cabinets', materials: [3] },
  { id: 4, name: 'Drawer Box', basePrice: 35.00, category: 'Cabinets', materials: [3] },
  { id: 5, name: 'Shelf Unit', basePrice: 25.00, category: 'Storage', materials: [1, 3] }
];