// ============================================================================
// COMPREHENSIVE API SERVICE
// All endpoints for ISO 9001 Manufacturing ERP
// ============================================================================

import apiClient from './apiClient';

/**
 * PROCUREMENT API
 */
export const procurementAPI = {
  // Purchase Orders
  createPurchaseOrder: (data: any) =>
    apiClient.instance.post('/procurement', data),
  getPurchaseOrder: (id: string) =>
    apiClient.instance.get(`/procurement/po/${id}`),
  listPurchaseOrders: (params?: any) =>
    apiClient.instance.get('/procurement', { params }),
  updatePurchaseOrderStatus: (id: string, status: string) =>
    apiClient.instance.put(`/procurement/${id}/status`, { status }),

  // Goods Receipt Notes
  logGoodsReceipt: (data: any) =>
    apiClient.instance.post('/procurement/grn/log', data),
  getGoodsReceipt: (id: string) =>
    apiClient.instance.get(`/procurement/grn/${id}`),
  listGoodsReceipts: (params?: any) =>
    apiClient.instance.get('/procurement/grn', { params }),

  // Material Batches
  getMaterialBatches: (params?: any) =>
    apiClient.instance.get('/procurement/batches', { params }),
  getMaterialBatch: (id: string) =>
    apiClient.instance.get(`/procurement/batch/${id}`),
  getBatchTraceability: (id: string) =>
    apiClient.instance.get(`/procurement/batch/${id}/traceability`),
};

/**
 * INVENTORY API
 */
export const inventoryAPI = {
  // Available Inventory
  getAvailableInventory: (materialId: string) =>
    apiClient.instance.get(`/inventory/available/${materialId}`),
  getStockSummary: () =>
    apiClient.instance.get('/inventory/summary'),
  getExpiryAlerts: (daysFromNow: number = 30) =>
    apiClient.instance.get('/inventory/alerts/expiry', {
      params: { daysFromNow },
    }),

  // Inventory Lots
  listInventoryLots: (params?: any) =>
    apiClient.instance.get('/inventory/lots', { params }),
  getInventoryLotDetail: (lotId: string) =>
    apiClient.instance.get(`/inventory/lot/${lotId}`),
  updateLotState: (lotId: string, data: any) =>
    apiClient.instance.put(`/inventory/lot/${lotId}/state`, data),

  // FEFO Allocation
  allocateInventoryFEFO: (data: any) =>
    apiClient.instance.post('/inventory/allocate-fefo', data),
  getAllocationDetails: (batchCardId: string) =>
    apiClient.instance.get(`/inventory/allocation/${batchCardId}`),
};

/**
 * PRODUCTION API
 */
export const productionAPI = {
  // Batch Cards
  createBatchCard: (data: any) =>
    apiClient.instance.post('/production/batch-card', data),
  getBatchCard: (id: string) =>
    apiClient.instance.get(`/production/batch-card/${id}`),
  listBatchCards: (params?: any) =>
    apiClient.instance.get('/production/batch-card', { params }),
  releaseBatchCard: (id: string) =>
    apiClient.instance.put(`/production/batch-card/${id}/release`, {}),

  // Production Execution
  startProduction: (data: any) =>
    apiClient.instance.post('/production/start', data),
  logMaterialConsumption: (data: any) =>
    apiClient.instance.post('/production/consume', data),
  completeProduction: (batchCardId: string, data: any) =>
    apiClient.instance.put(`/production/complete/${batchCardId}`, data),

  // Logs & Analytics
  getProductionLogs: (batchCardId: string) =>
    apiClient.instance.get(`/production/logs/${batchCardId}`),
  getProductionDashboard: () =>
    apiClient.instance.get('/production/dashboard'),
  getYieldAnalysis: (params?: any) =>
    apiClient.instance.get('/production/yield-analysis', { params }),
};

/**
 * QUALITY CONTROL API
 */
export const qcAPI = {
  // QC Tests
  createQCTest: (data: any) =>
    apiClient.instance.post('/qc', data),
  getQCTest: (id: string) =>
    apiClient.instance.get(`/qc/${id}`),
  listQCTests: (params?: any) =>
    apiClient.instance.get('/qc', { params }),

  // QC Approvals
  approveQCTest: (id: string, data?: any) =>
    apiClient.instance.put(`/qc/${id}/approve`, data || {}),
  rejectQCTest: (id: string, data: any) =>
    apiClient.instance.put(`/qc/${id}/reject`, data),

  // QC Gates
  getIncomingQCGate: (batchId: string) =>
    apiClient.instance.get(`/qc/gate/incoming/${batchId}`),
  getOutgoingQCGate: (fgBatchId: string) =>
    apiClient.instance.get(`/qc/gate/outgoing/${fgBatchId}`),
  getQCPendingItems: (type?: string) =>
    apiClient.instance.get('/qc/pending-items', { params: { type } }),

  // QC Reports
  getQCReport: (params?: any) =>
    apiClient.instance.get('/qc/reports/summary', { params }),
};

/**
 * REPORTS API
 */
export const reportsAPI = {
  // Traceability
  getBatchTraceability: (batchId: string) =>
    apiClient.instance.get(`/reports/traceability/batch/${batchId}`),
  getProductTraceability: (productBatchId: string) =>
    apiClient.instance.get(`/reports/traceability/product/${productBatchId}`),
  getMaterialGenealogyReport: (materialBatchId: string) =>
    apiClient.instance.get(`/reports/traceability/genealogy/${materialBatchId}`),

  // Consumption
  getBatchConsumptionReport: (batchCardId: string) =>
    apiClient.instance.get(`/reports/consumption/batch/${batchCardId}`),

  // Quality
  getSupplierQualityReport: (supplierId: string, params?: any) =>
    apiClient.instance.get(`/reports/quality/supplier/${supplierId}`, {
      params,
    }),

  // Production
  getProductionEfficiencyReport: (params?: any) =>
    apiClient.instance.get('/reports/production/efficiency', { params }),

  // Inventory
  getInventoryTurnoverReport: (params?: any) =>
    apiClient.instance.get('/reports/inventory/turnover', { params }),

  // Compliance
  getComplianceReport: (params?: any) =>
    apiClient.instance.get('/reports/compliance', { params }),
  getAuditTrail: (entityType: string, entityId: string, params?: any) =>
    apiClient.instance.get(`/reports/audit/${entityType}/${entityId}`, {
      params,
    }),

  // Risk
  getExpiryRiskReport: (params?: any) =>
    apiClient.instance.get('/reports/risk/expiry', { params }),

  // Dashboard
  getDashboardMetrics: () =>
    apiClient.instance.get('/reports/dashboard/metrics'),
};

/**
 * SALES ORDER API
 */
export const salesOrderAPI = {
  createSalesOrder: (data: any) =>
    apiClient.instance.post('/sales-orders', data),
  getSalesOrder: (id: string) =>
    apiClient.instance.get(`/sales-orders/${id}`),
  listSalesOrders: (params?: any) =>
    apiClient.instance.get('/sales-orders', { params }),
  updateSalesOrder: (id: string, data: any) =>
    apiClient.instance.put(`/sales-orders/${id}`, data),
};

/**
 * DELIVERY NOTES API
 */
export const deliveryNotesAPI = {
  createDeliveryNote: (data: any) =>
    apiClient.instance.post('/delivery-notes', data),
  getDeliveryNote: (id: string) =>
    apiClient.instance.get(`/delivery-notes/${id}`),
  listDeliveryNotes: (params?: any) =>
    apiClient.instance.get('/delivery-notes', { params }),
  updateDeliveryNote: (id: string, data: any) =>
    apiClient.instance.put(`/delivery-notes/${id}`, data),
};

// Export all APIs as a single object
export const api = {
  procurement: procurementAPI,
  inventory: inventoryAPI,
  production: productionAPI,
  qc: qcAPI,
  reports: reportsAPI,
  salesOrders: salesOrderAPI,
  deliveryNotes: deliveryNotesAPI,
};

// Export apiClient for direct use
export { apiClient };

export default api;
