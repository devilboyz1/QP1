const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class QuotationAPI {
  async createQuotation(quotationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(this.formatQuotationForAPI(quotationData))
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create quotation');
      }

      return result;
    } catch (error) {
      console.error('Create quotation error:', error);
      throw error;
    }
  }

  async saveQuotationDraft(quotationData, quotationId = null) {
    try {
      const url = quotationId 
        ? `${API_BASE_URL}/quotations/${quotationId}/draft`
        : `${API_BASE_URL}/quotations/draft`;
      
      const response = await fetch(url, {
        method: quotationId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(this.formatQuotationForAPI(quotationData))
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save draft');
      }

      return result;
    } catch (error) {
      console.error('Save draft error:', error);
      throw error;
    }
  }

  async updateQuotation(quotationId, quotationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(this.formatQuotationForAPI(quotationData))
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update quotation');
      }

      return result;
    } catch (error) {
      console.error('Update quotation error:', error);
      throw error;
    }
  }

  async getQuotation(quotationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quotation');
      }

      return result;
    } catch (error) {
      console.error('Get quotation error:', error);
      throw error;
    }
  }

  async listQuotations() {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quotations');
      }

      return result;
    } catch (error) {
      console.error('List quotations error:', error);
      throw error;
    }
  }

  formatQuotationForAPI(quotationData) {
    return {
      title: quotationData.title,
      description: quotationData.description,
      client_id: quotationData.client?.id || null,
      project_name: quotationData.projectName,
      due_date: quotationData.dueDate ? new Date(quotationData.dueDate).toISOString() : null,
      notes: quotationData.notes,
      markup: quotationData.markupPercentage || 0,
      tax_rate: quotationData.taxRate || 0,
      items: quotationData.items.map(item => ({
        component_id: item.componentId,
        length: parseFloat(item.length) || 1,
        width: parseFloat(item.width) || 1,
        height: parseFloat(item.height) || 1,
        quantity: parseInt(item.quantity) || 1,
        notes: item.notes || ''
      }))
    };
  }

  formatQuotationFromAPI(apiData) {
    return {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      quotationNo: apiData.quotation_no,
      status: apiData.status,
      totalCost: apiData.total_cost,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
      client: apiData.client,
      items: apiData.items?.map(item => ({
        id: item.id,
        componentId: item.component_id,
        component: item.component,
        length: item.length,
        width: item.width,
        height: item.height,
        quantity: item.quantity,
        unitCost: item.unit_cost,
        totalCost: item.total_cost
      })) || [],
      materials: apiData.materials || []
    };
  }
}

export const quotationAPI = new QuotationAPI();
export default quotationAPI;