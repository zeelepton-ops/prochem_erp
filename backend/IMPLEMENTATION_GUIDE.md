
# 🔧 Implementation Guide - Enterprise ERP Services

## Overview

This guide explains how to implement the 4 core services and integrate them into API routes. All services have been designed and are ready for implementation.

---

## Service Architecture

### 1. **TraceabilityService** ⭐ Core Workflow
**File**: `backend/src/services/TraceabilityService.ts`

#### Methods (7-Step Procurement-to-Delivery)

##### Step 1: Create Purchase Order
```typescript
const po = await traceabilityService.createPurchaseOrder({
  supplierId: '123e4567-e89b-12d3-a456-426614174000',
  items: [
    { materialId: 'mat1', quantity: 100, unitPrice: 50 },
    { materialId: 'mat2', quantity: 50, unitPrice: 75 }
  ],
  expectedDeliveryDate: new Date('2025-01-20'),
  createdBy: userId
});
// Output: PurchaseOrder with PO number
```

##### Step 2: Log Goods Receipt (Material → QUARANTINE)
```typescript
const grn = await traceabilityService.logGoodsReceipt({
  poId: po.id,
  items: [
    {
      materialId: 'mat1',
      quantityReceived: 100,
      supplierBatchNo: 'BATCH-001',
      manufacturingDate: new Date('2024-12-01'),
      expiryDate: new Date('2025-12-01')
    }
  ],
  receivedBy: userId
});
// Creates: GRN, RawMaterialBatch (QUARANTINE), InventoryLot (QUARANTINE)
// Audit: Material received and placed in quarantine
```

##### Step 3: Log QC Test Result
```typescript
const qcTest = await traceabilityService.logQCTestResult({
  materialBatchId: grn.batches[0].id,
  testParameters: {
    appearance: 'GOOD',
    moistureContent: 8.5,
    certification: true
  },
  results: { /* test results */ },
  result: 'PASSED', // or 'FAILED'
  testedBy: userId,
  approvedBy: userId
});
// If PASSED: Material → APPROVED, InventoryLot → APPROVED
// If FAILED: Material → REJECTED, InventoryLot → REJECTED
```

##### Step 4: Create Batch Card with FEFO
```typescript
const batchCard = await traceabilityService.createBatchCard({
  soId: salesOrder.id,
  productId: product.id,
  plannedQuantity: 1000,
  theoreticalYield: 950, // 95% target yield
  formulas: [
    { materialId: 'mat1', quantity: 500, scrapPercent: 2 },
    { materialId: 'mat2', quantity: 300, scrapPercent: 1.5 }
  ],
  createdBy: userId
});
// Uses FEFO allocation automatically:
// For each material, allocates approved inventory in expiry date order
```

##### Step 5: Log Production Consumption
```typescript
await traceabilityService.logProductionConsumption({
  batchCardId: batchCard.id,
  inventoryLotId: lot.id,
  quantityConsumed: 100,
  loggedBy: userId
});
// Updates inventory_lot: quantity_on_hand decremented
// When empty: state → CONSUMED
```

##### Step 6: Log Finished Goods Production
```typescript
const fgBatch = await traceabilityService.logFinishedGoodsProduction({
  batchCardId: batchCard.id,
  productId: product.id,
  quantityProduced: 950,
  scrapQuantity: 50,
  operatorId: userId
});
// Creates FinishedGoodsBatch with state = QUARANTINE (pending QC)
```

##### Step 7: Create Delivery & Store Issue Voucher
```typescript
const { deliveryNote, storeIssueVoucher } = 
  await traceabilityService.createDeliveryAndIssueVoucher({
    soId: salesOrder.id,
    fgBatchId: fgBatch.id,
    quantityToDispatch: 950,
    issuedBy: userId
  });
// Creates DeliveryNote, StoreIssueVoucher
// FG → DISPATCHED
// Complete traceability chain recorded
```

---

### 2. **QualityControlService** ⭐ QC Gate Enforcement
**File**: `backend/src/services/QualityControlService.ts`

#### Two QC Gates

##### QC Gate 1: Incoming (Raw Material)
```typescript
const incomingQC = await qualityControlService.performIncomingQC({
  materialBatchId: rawMaterialBatch.id,
  parameters: {
    appearance: 'GOOD',
    moistureContent: 8.2,
    packagingIntegrity: 'INTACT',
    labelAccuracy: true,
    certification: true,
    customTests: { 'particle_size': 'PASS' }
  },
  testedBy: userId
});

// Result structure:
// {
//   qcTest: QCTestResult,
//   result: {
//     passed: true,
//     checks: [
//       { name: 'Appearance', value: 'GOOD', status: 'PASS' },
//       { name: 'Moisture Content (%)', value: 8.2, status: 'PASS' }
//     ],
//     notes: []
//   }
// }
```

##### QC Gate 2: Outgoing (Finished Goods)
```typescript
const outgoingQC = await qualityControlService.performOutgoingQC({
  fgBatchId: finishedGoodsBatch.id,
  parameters: {
    appearance: 'GOOD',
    weight: 2.5,
    packaging: 'INTACT',
    labelAccuracy: true,
    storageRequirements: 'AMBIENT'
  },
  testedBy: userId
});
```

##### QC Approval (Execute State Transition)
```typescript
const approval = await qualityControlService.approveQCTest({
  qcTestId: qcTest.id,
  approvalDecision: 'APPROVED', // or 'REJECTED'
  comments: 'All parameters within specification',
  approvedBy: qcManagerUserId
});

// If APPROVED: Material → APPROVED, InventoryLot → APPROVED
// If REJECTED: Material → REJECTED, batch cannot be used
```

---

### 3. **InventoryService** ⭐ FEFO Management
**File**: `backend/src/services/InventoryService.ts`

#### FEFO Allocation Algorithm
```typescript
// Get available inventory (sorted by expiry - earliest first)
const available = await inventoryService.getAvailableInventory(materialId);
// Returns: [
//   { lot: 'LOT-001', expiry: '2025-03-01', available_qty: 500 },
//   { lot: 'LOT-002', expiry: '2025-04-15', available_qty: 300 },
//   { lot: 'LOT-003', expiry: '2025-06-01', available_qty: 200 }
// ]

// Allocate with FEFO
const allocation = await inventoryService.allocateWithFEFO({
  batchCardId: batchCard.id,
  materialId: material.id,
  requiredQuantity: 800,
  allocatedBy: userId
});

// Result:
// Allocates 500 from LOT-001 (earliest expiry first)
// Then 300 from LOT-002
// Total: 800 units reserved in FEFO order
```

#### Expiry Management
```typescript
// Get materials expiring soon (within 30 days)
const expiringLots = await inventoryService.getExpiryAlerts(30);
// Returns: materials expiring within 30 days

// Auto-expire expired inventory (run via scheduler)
const expired = await inventoryService.autoExpireInventory();
// Marks all expired batches automatically
```

#### Inventory Health
```typescript
const health = await inventoryService.getInventoryHealth();
// Returns:
// {
//   totalBatches: 250,
//   quarantinedBatches: 15,
//   rejectedBatches: 5,
//   expiredBatches: 2,
//   expiringsoon: 18,
//   availableForProduction: 50000 // units
// }
```

---

### 4. **ProductionService** ⭐ Production Execution
**File**: `backend/src/services/ProductionService.ts`

#### Production Flow

##### Release Batch Card
```typescript
const { batchCard, productionExecution } = 
  await productionService.releaseBatchCard({
    batchCardId: batchCard.id,
    releasedBy: userId
  });
// Status: PENDING → RELEASED
// Creates ProductionExecution record
```

##### Start Production
```typescript
await productionService.startProduction({
  batchCardId: batchCard.id,
  operatorId: operatorUserId,
  shiftNumber: 'SHIFT-A'
});
// Status: RELEASED → IN_PRODUCTION
```

##### Log Consumption
```typescript
const log = await productionService.logMaterialConsumption({
  batchCardId: batchCard.id,
  inventoryLotId: lot.id,
  quantityConsumed: 100,
  timestamp: new Date(),
  loggedBy: operatorUserId
});
// Decrements inventory_lot.quantity_on_hand
// Tracks consumption by lot (lot-level traceability)
```

##### Complete Production
```typescript
const { batchCard, finishedGoods } = 
  await productionService.completeProduction({
    batchCardId: batchCard.id,
    quantityProduced: 950,
    scrapQuantity: 50,
    comments: 'Normal production',
    completedBy: operatorUserId
  });

// Result:
// {
//   batchCard: { yield_percent: 100 }, // (950/950 * 100)
//   finishedGoods: FinishedGoodsBatch // state = QUARANTINE
// }
```

#### Yield Analysis
```typescript
// Get dashboard stats
const dashboard = await productionService.getProductionDashboard();
// {
//   pending_batches: 5,
//   active_batches: 3,
//   avg_yield_percent: 96.2
// }

// Get low yield batches (< 95%)
const lowYield = await productionService.getLowYieldBatches(95);
// Returns batches with yield below 95%

// Yield analysis report
const analysis = await productionService.getYieldAnalysis(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
// {
//   production_date: '2025-01-15',
//   batches_produced: 8,
//   avg_yield: 96.5,
//   min_yield: 93.2,
//   max_yield: 98.7
// }
```

---

### 5. **ReportsService** ⭐ Traceability & Analytics
**File**: `backend/src/services/ReportsService.ts`

#### Forward Traceability
```typescript
const trace = await reportsService.getProductTraceability(fgBatchId);
// Returns: FG → Materials used → Raw batches
```

#### Reverse Traceability
```typescript
const reverse = await reportsService.getReverseTraceability(materialBatchId);
// Returns: Material batch → All products containing it → Customers delivered to
```

#### Material Journey
```typescript
const journey = await reportsService.getMaterialJourney(materialBatchId);
// Complete journey: Supplier → GRN → QC → Production → FG → Customer
```

#### Reports
```typescript
// Production summary
const prodReport = await reportsService.getProductionSummary(startDate, endDate);

// Quality performance
const qcReport = await reportsService.getQualityPerformance(startDate, endDate);

// Supplier quality
const suppReport = await reportsService.getSupplierQualityReport(startDate, endDate);

// Inventory aging
const agingReport = await reportsService.getInventoryAgingReport();
```

---

## API Route Implementation Pattern

### Example: Procurement Routes

```typescript
// backend/src/routes/procurement.ts

import express from 'express';
import { traceabilityService } from '../services/TraceabilityService';
import { qualityControlService } from '../services/QualityControlService';
import { auth } from '../middleware/auth';

const router = express.Router();

// POST /api/procurement/purchase-orders
router.post('/purchase-orders', auth, async (req, res, next) => {
  try {
    const { supplierId, items, expectedDeliveryDate } = req.body;
    
    // Validation
    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields'
      });
    }

    // Create PO
    const po = await traceabilityService.createPurchaseOrder({
      supplierId,
      items,
      expectedDeliveryDate,
      createdBy: req.user.id
    });

    res.json(po);
  } catch (error) {
    next(error);
  }
});

// POST /api/procurement/goods-receipt
router.post('/goods-receipt', auth, async (req, res, next) => {
  try {
    const { poId, items } = req.body;

    // Call service
    const grn = await traceabilityService.logGoodsReceipt({
      poId,
      items,
      receivedBy: req.user.id
    });

    res.json(grn);
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Example: QC Routes

```typescript
// backend/src/routes/qc.ts

import express from 'express';
import { qualityControlService } from '../services/QualityControlService';
import { auth } from '../middleware/auth';

const router = express.Router();

// POST /api/qc/incoming-test
router.post('/incoming-test', auth, async (req, res, next) => {
  try {
    const { materialBatchId, parameters } = req.body;

    const result = await qualityControlService.performIncomingQC({
      materialBatchId,
      parameters,
      testedBy: req.user.id
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/qc/approve
router.post('/approve', auth, async (req, res, next) => {
  try {
    const { qcTestId, approvalDecision, comments } = req.body;

    const approval = await qualityControlService.approveQCTest({
      qcTestId,
      approvalDecision,
      comments,
      approvedBy: req.user.id
    });

    res.json(approval);
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## Database Schema Integration

### Key Tables for Services

```sql
-- Traceability Chain
raw_material_batches
  ├─ id
  ├─ batch_number
  ├─ supplier_id
  ├─ status (QUARANTINE → APPROVED → ALLOCATED → CONSUMED)
  ├─ expiry_date
  └─ qc_approved_by, qc_approved_date

inventory_lots (FEFO unit)
  ├─ id
  ├─ material_batch_id
  ├─ state (QUARANTINE → APPROVED → ALLOCATED → CONSUMED)
  ├─ quantity_on_hand
  ├─ quantity_reserved
  └─ approval_date

batch_cards (Production Order)
  ├─ id
  ├─ batch_card_number
  ├─ status (PENDING → RELEASED → IN_PRODUCTION → COMPLETE)
  ├─ theoretical_yield
  ├─ actual_quantity
  ├─ yield_percent
  └─ production_start, production_end

batch_card_allocations (FEFO Assignments)
  ├─ batch_card_id
  ├─ inventory_lot_id
  ├─ allocated_quantity
  └─ allocation_order (1=earliest expiry, 2=next, etc.)

finished_goods_batches
  ├─ state (QUARANTINE → APPROVED → ALLOCATED → DISPATCHED)
  ├─ qc_status
  └─ qc_approved_by

audit_logs (ISO 9001)
  ├─ entity_type
  ├─ entity_id
  ├─ action
  ├─ old_values
  ├─ new_values
  └─ user_id
```

---

## Error Handling

```typescript
// Service layer errors
try {
  await inventoryService.allocateWithFEFO({...});
} catch (error) {
  if (error.message === 'No approved inventory available for material') {
    // Return 409 CONFLICT
  } else if (error.message === 'Insufficient inventory') {
    // Return 400 BAD REQUEST
  }
}

// Recommended error codes:
// 400: Validation error, state transition not allowed
// 401: Unauthorized
// 403: Forbidden
// 404: Resource not found
// 409: Conflict (e.g., material not in QUARANTINE for QC)
// 500: Server error
```

---

## Testing Workflow

```typescript
// 1. Create PO
const po = await traceabilityService.createPurchaseOrder({...});

// 2. Log GRN (Material → QUARANTINE)
const grn = await traceabilityService.logGoodsReceipt({...});
assert(material.status === 'QUARANTINE');

// 3. Perform QC
const qc = await qualityControlService.performIncomingQC({...});

// 4. Approve QC (QUARANTINE → APPROVED)
await qualityControlService.approveQCTest({...});
assert(material.status === 'APPROVED');

// 5. Create Batch Card with FEFO
const bc = await traceabilityService.createBatchCard({...});
// Automatically allocates in FEFO order

// 6. Start Production
await productionService.releaseBatchCard({...});
await productionService.startProduction({...});

// 7. Log Consumption
await productionService.logMaterialConsumption({...});

// 8. Complete Production
const result = await productionService.completeProduction({...});

// 9. Verify Traceability
const trace = await reportsService.getProductTraceability(fgBatchId);
assert(trace.includes(rawMaterialBatch));
```

---

## Next Steps

1. **Database Migration**
   - Apply schema_iso9001.prisma to database
   - Run: `npx prisma migrate dev`

2. **Create Controllers** (wire services)
   - Create all controller files
   - Map routes to controller methods

3. **Add Input Validation**
   - Validate all request bodies
   - Check user permissions

4. **Implement Error Handling**
   - Global error middleware
   - Service-specific error handling

5. **Frontend Integration**
   - Update forms to call new APIs
   - Add QC test parameters UI
   - Add production dashboard

---

## Reference

- Services: `backend/src/services/`
- Database Schema: `backend/prisma/schema_iso9001.prisma`
- API Routes: `backend/src/routes/API_ROUTES.md`
- Architecture: `backend/ARCHITECTURE.md`
