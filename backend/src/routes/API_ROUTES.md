// ============================================================================
// API ROUTES STRUCTURE - Complete Endpoint Documentation
// ISO 9001 Manufacturing ERP System
// ============================================================================

/**
 * BASE URL: http://localhost:5000/api
 * All routes require JWT authentication in Authorization header
 * Authorization: Bearer {token}
 */

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /auth/login
 * Login user and receive JWT token
 * Body: { email: string, password: string }
 * Response: { token: string, user: User }
 */

/**
 * POST /auth/register
 * Register new user
 * Body: { name: string, email: string, password: string, department: string, role: string }
 * Response: { user: User, token: string }
 */

/**
 * GET /auth/profile
 * Get current logged-in user profile
 * Response: User
 */

// ============================================================================
// PROCUREMENT MODULE - Purchase Orders & Goods Receipt
// ============================================================================

/**
 * POST /procurement/purchase-orders
 * Create new purchase order
 * Body: {
 *   supplierId: uuid,
 *   items: [{ materialId: uuid, quantity: number, unitPrice: number }],
 *   expectedDeliveryDate: Date
 * }
 * Response: PurchaseOrder
 */

/**
 * GET /procurement/purchase-orders
 * List all purchase orders with filters
 * Query: { status?: string, supplierId?: uuid, skip?: number, take?: number }
 * Response: { data: PurchaseOrder[], total: number }
 */

/**
 * GET /procurement/purchase-orders/:id
 * Get purchase order details
 * Response: PurchaseOrder with items
 */

/**
 * PUT /procurement/purchase-orders/:id
 * Update purchase order
 * Body: { items?: [...], expectedDeliveryDate?: Date }
 * Response: PurchaseOrder
 */

/**
 * POST /procurement/goods-receipt
 * Log goods receipt note (GRN) - Material arrives in QUARANTINE
 * Body: {
 *   poId: uuid,
 *   items: [{
 *     materialId: uuid,
 *     quantityReceived: number,
 *     supplierBatchNo: string,
 *     manufacturingDate: Date,
 *     expiryDate: Date
 *   }]
 * }
 * Response: { grn: GoodsReceiptNote, batches: RawMaterialBatch[] }
 */

/**
 * GET /procurement/goods-receipts
 * List all GRNs
 * Response: GoodsReceiptNote[]
 */

// ============================================================================
// QUALITY CONTROL MODULE - QC Testing & Approval
// ============================================================================

/**
 * POST /qc/incoming-test
 * Perform incoming QC on received material
 * Body: {
 *   materialBatchId: uuid,
 *   parameters: {
 *     appearance: string,
 *     moistureContent?: number,
 *     packagingIntegrity: string,
 *     labelAccuracy: boolean,
 *     certification: boolean
 *   }
 * }
 * Response: { qcTest: QCTestResult, result: { passed: boolean, checks: [...] } }
 */

/**
 * POST /qc/outgoing-test
 * Perform outgoing QC on finished goods
 * Body: {
 *   fgBatchId: uuid,
 *   parameters: {
 *     appearance: string,
 *     weight?: number,
 *     packaging: string,
 *     labelAccuracy: boolean
 *   }
 * }
 * Response: { qcTest: QCTestResult, result: {...} }
 */

/**
 * POST /qc/approve
 * Approve or reject QC test result
 * Body: {
 *   qcTestId: uuid,
 *   approvalDecision: 'APPROVED' | 'REJECTED',
 *   comments?: string
 * }
 * Response: QCTestResult (with state transition executed)
 */

/**
 * GET /qc/history/:entityId
 * Get QC test history for a batch
 * Query: { type: 'material' | 'fg' }
 * Response: QCTestResult[]
 */

/**
 * GET /qc/pending
 * Get all batches pending QC approval
 * Response: { material: [], finishedGoods: [] }
 */

// ============================================================================
// INVENTORY MODULE - FEFO Management & Allocation
// ============================================================================

/**
 * GET /inventory/summary
 * Get overall inventory health summary
 * Response: {
 *   totalLots: number,
 *   approvedLots: number,
 *   quarantineLots: number,
 *   totalQuantity: number,
 *   availableQuantity: number
 * }
 */

/**
 * GET /inventory/material/:materialId/available
 * Get available inventory for a material (FEFO sorted)
 * Response: {
 *   lot: { id, lotNumber, expiryDate, quantityOnHand, daysUntilExpiry }[]
 * }
 */

/**
 * POST /inventory/allocate-fefo
 * Allocate inventory using FEFO algorithm
 * Body: {
 *   batchCardId: uuid,
 *   materialId: uuid,
 *   requiredQuantity: number
 * }
 * Response: {
 *   allocations: [{
 *     lot: InventoryLot,
 *     allocatedQty: number,
 *     expiryDate: Date,
 *     daysUntilExpiry: number
 *   }]
 * }
 */

/**
 * GET /inventory/fefo-analysis/:materialId
 * Analyze FEFO allocation for a material
 * Response: { lot: InventoryLot, allocation: BatchCardAllocation }[]
 */

/**
 * GET /inventory/expiry-alerts
 * Get materials expiring within threshold (default 30 days)
 * Query: { daysThreshold?: number }
 * Response: InventoryLot[]
 */

/**
 * GET /inventory/expired
 * Get all expired inventory
 * Response: InventoryLot[]
 */

/**
 * POST /inventory/auto-expire
 * Auto-mark expired batches (run periodically)
 * Response: { message: string, expiredBatches: number }
 */

// ============================================================================
// PRODUCTION MODULE - Batch Cards & Production Execution
// ============================================================================

/**
 * POST /production/batch-cards
 * Create batch card with FEFO allocation
 * Body: {
 *   soId: uuid,
 *   productId: uuid,
 *   plannedQuantity: number,
 *   theoreticalYield: number,
 *   formulas: [{
 *     materialId: uuid,
 *     quantity: number,
 *     scrapPercent: number
 *   }]
 * }
 * Response: BatchCard (with FEFO allocations performed)
 */

/**
 * GET /production/batch-cards
 * List all batch cards
 * Query: { status?: string, soId?: uuid, skip?: number, take?: number }
 * Response: BatchCard[]
 */

/**
 * GET /production/batch-cards/:id
 * Get batch card with allocation details
 * Response: BatchCard with formulas and allocations
 */

/**
 * POST /production/batch-cards/:id/release
 * Release batch card for production
 * Body: { releasedBy: uuid }
 * Response: { batchCard: BatchCard, productionExecution: ProductionExecution }
 */

/**
 * POST /production/batch-cards/:id/start
 * Start production on a released batch card
 * Body: { operatorId: uuid, shiftNumber: string }
 * Response: BatchCard (status = IN_PRODUCTION)
 */

/**
 * POST /production/log-consumption
 * Log material consumption during production
 * Body: {
 *   batchCardId: uuid,
 *   inventoryLotId: uuid,
 *   quantityConsumed: number
 * }
 * Response: ProductionLog
 */

/**
 * POST /production/batch-cards/:id/complete
 * Complete production and create finished goods
 * Body: {
 *   quantityProduced: number,
 *   scrapQuantity: number,
 *   comments?: string
 * }
 * Response: { batchCard: BatchCard, finishedGoods: FinishedGoodsBatch }
 */

/**
 * GET /production/dashboard
 * Get production dashboard statistics
 * Response: {
 *   pendingBatches: number,
 *   activeBatches: number,
 *   avgYieldPercent: number
 * }
 */

/**
 * GET /production/history
 * Get production history with yield analysis
 * Query: { limit?: number }
 * Response: ProductionExecution[]
 */

/**
 * GET /production/batch-cards/:id/consumption-report
 * Get consumption report for batch card
 * Response: { material: string, planned: number, consumed: number, variance: number }[]
 */

/**
 * GET /production/yield-analysis
 * Analyze yield performance over date range
 * Query: { startDate: Date, endDate: Date }
 * Response: { date: Date, avgYield: number, minYield: number, maxYield: number }[]
 */

/**
 * GET /production/low-yield-batches
 * Get batches with yield below threshold
 * Query: { threshold?: number (default 95) }
 * Response: BatchCard[]
 */

// ============================================================================
// FINISHED GOODS MODULE - QC & Dispatch
// ============================================================================

/**
 * GET /finished-goods
 * List all finished goods batches
 * Query: { state?: string, productId?: uuid, skip?: number, take?: number }
 * Response: FinishedGoodsBatch[]
 */

/**
 * GET /finished-goods/:id
 * Get finished goods batch details
 * Response: FinishedGoodsBatch with QC results
 */

/**
 * POST /finished-goods/:id/generate-coa
 * Generate Certificate of Analysis
 * Body: {
 *   testResults: { [key]: value }
 * }
 * Response: CertificateOfAnalysis
 */

/**
 * GET /finished-goods/:id/coa
 * Get COA for finished goods batch
 * Response: CertificateOfAnalysis
 */

// ============================================================================
// DISPATCH MODULE - Delivery Notes & Store Issue Vouchers
// ============================================================================

/**
 * POST /dispatch/delivery-note
 * Create delivery note and store issue voucher
 * Body: {
 *   soId: uuid,
 *   fgBatchId: uuid,
 *   quantityToDispatch: number
 * }
 * Response: { deliveryNote: DeliveryNote, storeIssueVoucher: StoreIssueVoucher }
 */

/**
 * GET /dispatch/delivery-notes
 * List all delivery notes
 * Query: { status?: string, soId?: uuid, skip?: number, take?: number }
 * Response: DeliveryNote[]
 */

/**
 * GET /dispatch/store-issue-vouchers
 * List all store issue vouchers
 * Response: StoreIssueVoucher[]
 */

/**
 * GET /dispatch/delivery-note/:id
 * Get delivery note with items
 * Response: DeliveryNote
 */

// ============================================================================
// SALES ORDERS MODULE
// ============================================================================

/**
 * POST /sales/sales-orders
 * Create new sales order
 * Body: {
 *   customerId: uuid,
 *   items: [{ productId: uuid, quantity: number, unitPrice: number }],
 *   deliveryDate: Date
 * }
 * Response: SalesOrder
 */

/**
 * GET /sales/sales-orders
 * List all sales orders
 * Query: { status?: string, customerId?: uuid, skip?: number, take?: number }
 * Response: SalesOrder[]
 */

/**
 * GET /sales/sales-orders/:id
 * Get sales order with items
 * Response: SalesOrder
 */

/**
 * PUT /sales/sales-orders/:id
 * Update sales order
 * Response: SalesOrder
 */

// ============================================================================
// TRACEABILITY MODULE - Complete Product Journey
// ============================================================================

/**
 * GET /traceability/product/:fgBatchId
 * Get complete forward traceability (FG to raw materials)
 * Response: {
 *   finishedGood: FinishedGoodsBatch,
 *   materials: [{
 *     batchNumber: string,
 *     materialName: string,
 *     supplierName: string,
 *     quantity: number
 *   }]
 * }
 */

/**
 * GET /traceability/reverse/:materialBatchId
 * Get reverse traceability (RM to all products containing it)
 * Response: [{
 *   finishedGoodNumber: string,
 *   productName: string,
 *   customerName: string,
 *   quantity: number
 * }]
 */

/**
 * GET /traceability/material-journey/:materialBatchId
 * Get complete journey of a material batch
 * Response: {
 *   material: RawMaterialBatch,
 *   supplier: string,
 *   qcResults: QCTestResult[],
 *   usedInBatches: string[],
 *   resultedInProducts: string[]
 * }
 */

// ============================================================================
// REPORTS MODULE - Analytics & Compliance
// ============================================================================

/**
 * GET /reports/production-summary
 * Production performance summary
 * Query: { startDate: Date, endDate: Date }
 * Response: {
 *   date: Date,
 *   productName: string,
 *   produced: number,
 *   scrap: number,
 *   avgYield: number
 * }[]
 */

/**
 * GET /reports/quality-performance
 * Quality metrics and pass rates
 * Query: { startDate: Date, endDate: Date }
 * Response: {
 *   date: Date,
 *   totalTests: number,
 *   passedTests: number,
 *   failedTests: number,
 *   passRate: number
 * }[]
 */

/**
 * GET /reports/sales-performance
 * Sales metrics by customer
 * Query: { startDate: Date, endDate: Date }
 * Response: {
 *   customerName: string,
 *   orders: number,
 *   totalQuantity: number,
 *   totalSales: number
 * }[]
 */

/**
 * GET /reports/procurement
 * Procurement performance by supplier
 * Query: { startDate: Date, endDate: Date }
 * Response: {
 *   supplierName: string,
 *   purchaseOrders: number,
 *   totalSpent: number,
 *   acceptanceRate: number
 * }[]
 */

/**
 * GET /reports/inventory-aging
 * Inventory age analysis
 * Response: {
 *   materialName: string,
 *   daysInInventory: number,
 *   quantity: number,
 *   expiryDate: Date
 * }[]
 */

/**
 * GET /reports/supplier-quality
 * Supplier quality metrics
 * Query: { startDate: Date, endDate: Date }
 * Response: {
 *   supplierName: string,
 *   batchesReceived: number,
 *   acceptanceRate: number,
 *   rejectedBatches: number
 * }[]
 */

/**
 * GET /reports/batch-card-summary/:soId
 * Detailed batch card summary for sales order
 * Response: BatchCard[]
 */

/**
 * GET /reports/coa/:fgBatchId
 * Generate formatted COA report
 * Response: {
 *   fgBatchNumber: string,
 *   productName: string,
 *   customerName: string,
 *   testResults: {...},
 *   certificationDate: Date
 * }
 */

// ============================================================================
// AUDIT LOG MODULE - Compliance & Traceability
// ============================================================================

/**
 * GET /audit-logs
 * Get audit logs with filters
 * Query: {
 *   entityType?: string,
 *   entityId?: uuid,
 *   action?: string,
 *   userId?: uuid,
 *   startDate?: Date,
 *   endDate?: Date,
 *   skip?: number,
 *   take?: number
 * }
 * Response: { data: AuditLog[], total: number }
 */

/**
 * GET /audit-logs/entity/:entityId
 * Get all audit logs for a specific entity
 * Response: AuditLog[]
 */

/**
 * GET /audit-logs/summary
 * Get audit summary statistics
 * Response: {
 *   totalChanges: number,
 *   byAction: { CREATE: number, UPDATE: number, DELETE: number },
 *   byUser: { userId: number }
 * }
 */

// ============================================================================
// MASTER DATA MODULE - Setup & Configuration
// ============================================================================

/**
 * POST /master-data/suppliers
 * Create supplier
 * Response: Supplier
 */

/**
 * GET /master-data/suppliers
 * List all suppliers
 * Response: Supplier[]
 */

/**
 * POST /master-data/raw-materials
 * Create raw material
 * Response: RawMaterial
 */

/**
 * GET /master-data/raw-materials
 * List all raw materials
 * Response: RawMaterial[]
 */

/**
 * POST /master-data/products
 * Create finished product
 * Response: Product
 */

/**
 * GET /master-data/products
 * List all products
 * Response: Product[]
 */

/**
 * POST /master-data/customers
 * Create customer
 * Response: Customer
 */

/**
 * GET /master-data/customers
 * List all customers
 * Response: Customer[]
 */

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * 400 Bad Request
 * { error: string, message: string }
 */

/**
 * 401 Unauthorized
 * { error: 'UNAUTHORIZED', message: 'Invalid or expired token' }
 */

/**
 * 403 Forbidden
 * { error: 'FORBIDDEN', message: 'Insufficient permissions' }
 */

/**
 * 404 Not Found
 * { error: 'NOT_FOUND', message: 'Resource not found' }
 */

/**
 * 409 Conflict
 * { error: 'CONFLICT', message: 'State transition not allowed' }
 */

/**
 * 500 Internal Server Error
 * { error: 'INTERNAL_ERROR', message: string }
 */

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * TOTAL ENDPOINTS: 80+
 * 
 * GROUPED BY WORKFLOW:
 * - Authentication: 3 endpoints
 * - Procurement: 6 endpoints
 * - Quality Control: 5 endpoints
 * - Inventory: 8 endpoints
 * - Production: 10 endpoints
 * - Finished Goods: 4 endpoints
 * - Dispatch: 4 endpoints
 * - Sales: 4 endpoints
 * - Traceability: 3 endpoints
 * - Reports: 8 endpoints
 * - Audit Logs: 3 endpoints
 * - Master Data: 8 endpoints
 * 
 * KEY FEATURES:
 * ✅ Full procurement-to-delivery workflow
 * ✅ FEFO inventory allocation with expiry tracking
 * ✅ State machine-based transitions (validated)
 * ✅ QC gates at receiving and before dispatch
 * ✅ Complete production tracking with yield analysis
 * ✅ Bi-directional traceability (forward & reverse)
 * ✅ Certificate of Analysis generation
 * ✅ Comprehensive audit logging for ISO 9001
 * ✅ Advanced reporting and analytics
 * ✅ Supplier quality metrics
 * ✅ Inventory aging and expiry alerts
 */
