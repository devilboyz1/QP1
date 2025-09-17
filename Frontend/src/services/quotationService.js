const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class QuotationService {
  async createQuotation(quotationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(quotationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create quotation');
      }

      return result;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  async saveDraft(quotationData, quotationId = null) {
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
        body: JSON.stringify(quotationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to save draft');
      }

      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
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
        body: JSON.stringify(quotationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to update quotation');
      }

      return result;
    } catch (error) {
      console.error('Error updating quotation:', error);
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
        throw new Error(result.error || 'Failed to fetch quotation');
      }

      return result;
    } catch (error) {
      console.error('Error fetching quotation:', error);
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
        throw new Error(result.error || 'Failed to fetch quotations');
      }

      return result;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  async deleteQuotation(quotationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete quotation');
      }

      return result;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }

  // NEW ENHANCED FUNCTIONS

  async updateQuotationStatus(quotationId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update quotation status');
      }

      return result;
    } catch (error) {
      console.error('Error updating quotation status:', error);
      throw error;
    }
  }

  async duplicateQuotation(quotationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to duplicate quotation');
      }

      return result;
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      throw error;
    }
  }

  async generateQuotationPDF(quotationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate PDF');
      }

      // Handle PDF blob response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-${quotationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'PDF generated successfully' };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // ADMIN FUNCTIONS

  async listAllQuotations(page = 1, limit = 10, status = '', search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(search && { search })
      });

      const response = await fetch(`${API_BASE_URL}/admin/quotations?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch all quotations');
      }

      return result;
    } catch (error) {
      console.error('Error fetching all quotations:', error);
      throw error;
    }
  }

  async searchQuotations(searchTerm, filters = {}) {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/quotations/search?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to search quotations');
      }

      return result;
    } catch (error) {
      console.error('Error searching quotations:', error);
      throw error;
    }
  }

  // REPORTING FUNCTIONS

  async generateSalesReport(startDate, endDate, format = 'json') {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        format
      });

      const response = await fetch(`${API_BASE_URL}/reports/sales?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate sales report');
      }

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sales-report-${startDate}-${endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Sales report downloaded' };
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  async generateMaterialUsageReport(startDate, endDate, format = 'json') {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        format
      });

      const response = await fetch(`${API_BASE_URL}/reports/material-usage?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate material usage report');
      }

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `material-usage-report-${startDate}-${endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Material usage report downloaded' };
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating material usage report:', error);
      throw error;
    }
  }

  // UTILITY FUNCTIONS

  formatQuotationData(quotationData) {
    return {
      title: quotationData.title,
      description: quotationData.description,
      client_id: quotationData.clientId || quotationData.client?.id,
      due_date: quotationData.dueDate,
      notes: quotationData.notes,
      markup: quotationData.markup || 0,
      tax_rate: quotationData.taxRate || 0,
      items: quotationData.items?.map(item => ({
        component_id: item.componentId || item.component_id,
        length: parseFloat(item.length) || 1,
        width: parseFloat(item.width) || 1,
        height: parseFloat(item.height) || 1,
        quantity: parseInt(item.quantity) || 1
      })) || []
    };
  }

  validateQuotationData(quotationData) {
    const errors = [];
    
    if (!quotationData.title?.trim()) {
      errors.push('Title is required');
    }
    
    // Remove client validation
    // if (!quotationData.clientId && !quotationData.client?.id) {
    //   errors.push('Client is required');
    // }
    
    if (!quotationData.items || quotationData.items.length === 0) {
      errors.push('At least one item is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const quotationService = new QuotationService();
export default quotationService;