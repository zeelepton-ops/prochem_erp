import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Purchase Orders
  getPurchaseOrders: (page = 1, limit = 10) =>
    apiClient.get(`/purchase-orders?page=${page}&limit=${limit}`),
  getPurchaseOrder: (id: string) =>
    apiClient.get(`/purchase-orders/${id}`),
  createPurchaseOrder: (data: any) =>
    apiClient.post('/purchase-orders', data),
  updatePurchaseOrder: (id: string, data: any) =>
    apiClient.put(`/purchase-orders/${id}`, data),
  deletePurchaseOrder: (id: string) =>
    apiClient.delete(`/purchase-orders/${id}`),

  // Sales Orders
  getSalesOrders: (page = 1, limit = 10) =>
    apiClient.get(`/sales-orders?page=${page}&limit=${limit}`),
  getSalesOrder: (id: string) =>
    apiClient.get(`/sales-orders/${id}`),
  createSalesOrder: (data: any) =>
    apiClient.post('/sales-orders', data),
  updateSalesOrder: (id: string, data: any) =>
    apiClient.put(`/sales-orders/${id}`, data),
  deleteSalesOrder: (id: string) =>
    apiClient.delete(`/sales-orders/${id}`),

  // Material Tests
  getMaterialTests: (page = 1, limit = 10) =>
    apiClient.get(`/material-tests?page=${page}&limit=${limit}`),
  getMaterialTest: (id: string) =>
    apiClient.get(`/material-tests/${id}`),
  createMaterialTest: (data: any) =>
    apiClient.post('/material-tests', data),
  updateMaterialTest: (id: string, data: any) =>
    apiClient.put(`/material-tests/${id}`, data),
  deleteMaterialTest: (id: string) =>
    apiClient.delete(`/material-tests/${id}`),

  // Production
  getProductions: (page = 1, limit = 10) =>
    apiClient.get(`/production?page=${page}&limit=${limit}`),
  getProduction: (id: string) =>
    apiClient.get(`/production/${id}`),
  createProduction: (data: any) =>
    apiClient.post('/production', data),
  updateProduction: (id: string, data: any) =>
    apiClient.put(`/production/${id}`, data),
  deleteProduction: (id: string) =>
    apiClient.delete(`/production/${id}`),

  // Delivery Notes
  getDeliveryNotes: (page = 1, limit = 10) =>
    apiClient.get(`/delivery-notes?page=${page}&limit=${limit}`),
  getDeliveryNote: (id: string) =>
    apiClient.get(`/delivery-notes/${id}`),
  createDeliveryNote: (data: any) =>
    apiClient.post('/delivery-notes', data),
  updateDeliveryNote: (id: string, data: any) =>
    apiClient.put(`/delivery-notes/${id}`, data),
  deleteDeliveryNote: (id: string) =>
    apiClient.delete(`/delivery-notes/${id}`),

  // Suppliers
  getSuppliers: (page = 1, limit = 10) =>
    apiClient.get(`/suppliers?page=${page}&limit=${limit}`),
  getSupplier: (id: string) =>
    apiClient.get(`/suppliers/${id}`),
  createSupplier: (data: any) =>
    apiClient.post('/suppliers', data),
  updateSupplier: (id: string, data: any) =>
    apiClient.put(`/suppliers/${id}`, data),
  deleteSupplier: (id: string) =>
    apiClient.delete(`/suppliers/${id}`),

  // Customers
  getCustomers: (page = 1, limit = 10) =>
    apiClient.get(`/customers?page=${page}&limit=${limit}`),
  getCustomer: (id: string) =>
    apiClient.get(`/customers/${id}`),
  createCustomer: (data: any) =>
    apiClient.post('/customers', data),
  updateCustomer: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) =>
    apiClient.delete(`/customers/${id}`),

  // Raw Materials
  getRawMaterials: (page = 1, limit = 10) =>
    apiClient.get(`/raw-materials?page=${page}&limit=${limit}`),
  getRawMaterial: (id: string) =>
    apiClient.get(`/raw-materials/${id}`),
  createRawMaterial: (data: any) =>
    apiClient.post('/raw-materials', data),
  updateRawMaterial: (id: string, data: any) =>
    apiClient.put(`/raw-materials/${id}`, data),
  deleteRawMaterial: (id: string) =>
    apiClient.delete(`/raw-materials/${id}`),

  // Products
  getProducts: (page = 1, limit = 10) =>
    apiClient.get(`/products?page=${page}&limit=${limit}`),
  getProduct: (id: string) =>
    apiClient.get(`/products/${id}`),
  createProduct: (data: any) =>
    apiClient.post('/products', data),
  updateProduct: (id: string, data: any) =>
    apiClient.put(`/products/${id}`, data),
  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),
}

export default apiService
