# Component API Documentation

## Overview
The Component API allows administrators to manage components, which are made up of multiple materials. Each component has a calculated total cost based on the materials and quantities used.

## Models

### Component
- `id`: Unique identifier
- `name`: Component name (unique, required)
- `description`: Component description
- `total_cost`: Calculated total cost of all materials
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `materials`: Array of ComponentMaterial relationships

### ComponentMaterial
- `id`: Unique identifier
- `component_id`: Reference to Component
- `material_id`: Reference to Material
- `quantity`: Quantity of material used in component

## API Endpoints

### 1. Create Component
**POST** `/api/admin/component`

**Request Body:**
```json
{
  "name": "Component Name",
  "description": "Component description",
  "materials": [
    {
      "material_id": 1,
      "quantity": 2.5
    },
    {
      "material_id": 2,
      "quantity": 1.0
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Component Name",
  "description": "Component description",
  "total_cost": 150.00,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "materials": [
    {
      "id": 1,
      "component_id": 1,
      "material_id": 1,
      "quantity": 2.5,
      "material": {
        "id": 1,
        "name": "Material 1",
        "unit_cost": 50.00,
        ...
      }
    }
  ]
}
```

### 2. List All Components
**GET** `/api/admin/components`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Component 1",
    "description": "Description 1",
    "total_cost": 150.00,
    "materials": [...]
  },
  {
    "id": 2,
    "name": "Component 2",
    "description": "Description 2",
    "total_cost": 200.00,
    "materials": [...]
  }
]
```

### 3. Get Specific Component
**GET** `/api/admin/component/:id`

**Response:** Same as Create Component response

### 4. Update Component
**PUT** `/api/admin/component/:id`

**Request Body:** Same as Create Component

**Response:** Updated component with materials

### 5. Delete Component
**DELETE** `/api/admin/component/:id`

**Response:**
```json
{
  "message": "Component deleted successfully"
}
```

## Features

1. **Automatic Cost Calculation**: Total cost is automatically calculated based on material unit costs and quantities
2. **Transaction Safety**: All operations use database transactions to ensure data consistency
3. **Material Validation**: Verifies that all referenced materials exist before creating relationships
4. **Cascading Deletes**: Deleting a component also removes all material relationships
5. **Admin Only**: All endpoints require admin authentication

## Usage Example

```bash
# Create a component
curl -X POST http://localhost:3000/api/admin/component \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electronic Circuit Board",
    "description": "PCB with components",
    "materials": [
      {"material_id": 1, "quantity": 1},
      {"material_id": 2, "quantity": 5},
      {"material_id": 3, "quantity": 2.5}
    ]
  }'

# List all components
curl -X GET http://localhost:3000/api/admin/components \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Error Handling

- **400 Bad Request**: Invalid request data or missing required fields
- **401 Unauthorized**: Missing or invalid admin token
- **404 Not Found**: Component or material not found
- **500 Internal Server Error**: Database or server errors 