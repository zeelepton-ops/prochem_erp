
# 🏭 ISO 9001 Manufacturing ERP System - Project Architecture

## 📊 System Overview

**Complete Manufacturing Management System** with:
- ✅ Full procurement-to-delivery workflow
- ✅ FEFO (First Expired, First Out) inventory management
- ✅ QC gates at procurement & dispatch stages
- ✅ Production batch tracking with yield analysis
- ✅ Bi-directional traceability (material → product & reverse)
- ✅ Certificate of Analysis (COA) generation
- ✅ ISO 9001 compliance with comprehensive audit logs
- ✅ State machine-based business logic validation

---

## 🗂️ Backend Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts              # PostgreSQL connection
│   │   ├── jwt.ts                   # JWT configuration
│   │   └── env.ts                   # Environment variables
│   │
│   ├── controllers/
│   │   ├── AuthController.ts        # Login, register, profile
│   │   ├── ProcurementController.ts # PO & GRN management
│   │   ├── QCController.ts          # QC testing & approval
│   │   ├── InventoryController.ts   # FEFO allocation
│   │   ├── ProductionController.ts  # Batch cards & execution
│   │   ├── DispatchController.ts    # Delivery notes & vouchers
│   │   ├── SalesController.ts       # Sales orders
│   │   ├── TraceabilityController.ts# Traceability queries
│   │   ├── ReportsController.ts     # Analytics & reports
│   │   └── AuditController.ts       # Audit log queries
│   │
│   ├── services/
│   │   ├── TraceabilityService.ts   # ⭐ Core workflow (7 steps)
│   │   │   ├── createPurchaseOrder()
│   │   │   ├── logGoodsReceipt()      # ➜ Material → QUARANTINE
│   │   │   ├── logQCTestResult()      # ➜ QC Gate 1 (approved/rejected)
│   │   │   ├── createBatchCard()      # ➜ FEFO allocation
│   │   │   ├── logProductionConsumption()
│   │   │   ├── logFinishedGoodsProduction()  # ➜ FG → QUARANTINE
│   │   │   └── createDeliveryAndIssueVoucher() # ➜ QC Gate 2
│   │   │
│   │   ├── QualityControlService.ts ⭐ QC Gate Enforcement
│   │   │   ├── performIncomingQC()
│   │   │   ├── performOutgoingQC()
│   │   │   ├── approveQCTest()
│   │   │   ├── getQCHistory()
│   │   │   └── getPendingQC()
│   │   │
│   │   ├── ProductionService.ts     ⭐ Production Execution
│   │   │   ├── releaseBatchCard()
│   │   │   ├── startProduction()
│   │   │   ├── logMaterialConsumption()
│   │   │   ├── completeProduction()
│   │   │   ├── getProductionDashboard()
│   │   │   ├── getConsumptionReport()
│   │   │   ├── getYieldAnalysis()
│   │   │   └── getLowYieldBatches()
│   │   │
│   │   ├── InventoryService.ts      ⭐ FEFO Management
│   │   │   ├── getAvailableInventory()
│   │   │   ├── allocateWithFEFO()       # ➜ Core FEFO algorithm
│   │   │   ├── getInventorySummary()
│   │   │   ├── getExpiryAlerts()
│   │   │   ├── getExpiredInventory()
│   │   │   ├── autoExpireInventory()
│   │   │   ├── getFEFOAnalysis()
│   │   │   ├── getAllocationStatus()
│   │   │   └── getInventoryHealth()
│   │   │
│   │   ├── ReportsService.ts        ⭐ Traceability & Analytics
│   │   │   ├── getProductTraceability()   # Forward trace
│   │   │   ├── getReverseTraceability()   # Reverse trace
│   │   │   ├── getMaterialJourney()
│   │   │   ├── generateCOAReport()
│   │   │   ├── getProductionSummary()
│   │   │   ├── getQualityPerformance()
│   │   │   ├── getSalesPerformance()
│   │   │   ├── getProcurementReport()
│   │   │   ├── getInventoryAgingReport()
│   │   │   ├── getSupplierQualityReport()
│   │   │   └── getBatchCardSummaryReport()
│   │   │
│   │   └── AuthService.ts           # User authentication
│   │
│   ├── models/                      # Database models (Prisma)
│   │   └── [Auto-generated from schema]
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # JWT verification
│   │   ├── error.ts                 # Error handling
│   │   └── validation.ts            # Request validation
│   │
│   ├── utils/
│   │   ├── stateMachines.ts         # ⭐ Business logic (4 machines)
│   │   │   ├── RawMaterialStateMachine
│   │   │   ├── InventoryLotStateMachine (FEFO)
│   │   │   ├── BatchCardStateMachine
│   │   │   └── FinishedGoodsStateMachine
│   │   │
│   │   ├── validators.ts            # Input validation
│   │   ├── helpers.ts               # Utility functions
│   │   └── constants.ts             # Global constants
│   │
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── procurement.ts
│   │   ├── qc.ts
│   │   ├── inventory.ts
│   │   ├── production.ts
│   │   ├── dispatch.ts
│   │   ├── sales.ts
│   │   ├── traceability.ts
│   │   ├── reports.ts
│   │   ├── audit.ts
│   │   ├── master-data.ts
│   │   └── API_ROUTES.md            # Complete endpoint documentation
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── prisma/
│   ├── schema.prisma                # Current schema (12 tables)
│   ├── schema_iso9001.prisma        # ⭐ Enterprise schema (25+ tables)
│   ├── migrations/
│   └── seed.ts                      # Database seeding
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📄 Database Schema (25+ Tables)

### Master Data
- **suppliers** - Vendor information
- **raw_materials** - RM specifications
- **products** - FG definitions
- **customers** - Customer details

### Procurement Flow
- **purchase_orders** - PO header
- **purchase_order_items** - PO line items
- **goods_receipt_notes** - GRN header
- **grn_items** - GRN line items

### Inventory Management
- **raw_material_batches** - RM batch tracking
- **inventory_lots** - FEFO tracking units (quantity, state, expiry)

### Quality Control
- **qc_test_results** - Test records with flexible parameters (JSON)

### Sales & Dispatch
- **sales_orders** - SO header
- **sales_order_items** - SO line items
- **delivery_notes** - DN header
- **delivery_note_items** - DN line items
- **store_issue_vouchers** - Official dispatch records
- **certificates_of_analysis** - COA documents

### Production
- **batch_cards** - Production order header
- **batch_card_formulas** - Material formula per product
- **batch_card_allocations** - FEFO allocations (with sequence)
- **production_execution** - Execution tracking
- **production_logs** - Material consumption logs
- **finished_goods_batches** - FG batch tracking

### Audit & Compliance
- **audit_logs** - All state changes (ISO 9001)
- **users** - System users

---

## 🔄 Core Workflow (Procurement → Delivery)

### 📦 Step 1: Procurement
```
CreatePurchaseOrder()
  └─ PO created with line items
     └─ Supplier selected
```

### 📥 Step 2: Goods Receipt (Material enters QUARANTINE)
```
LogGoodsReceipt()
  ├─ GRN created
  ├─ RawMaterialBatch created (status = QUARANTINE)
  ├─ InventoryLot created (state = QUARANTINE)
  └─ Audit log: Material received
```

### ✅ Step 3: QC Gate 1 (Receiving Inspection)
```
PerformIncomingQC()
  ├─ Test parameters evaluated
  └─ Result: PASSED or FAILED

ApproveQCTest()
  ├─ If PASSED:
  │  └─ Material → APPROVED (available for production)
  └─ If FAILED:
     └─ Material → REJECTED (cannot be used)
```

### 🎯 Step 4: Batch Card & FEFO Allocation
```
CreateBatchCard()
  ├─ BC created (status = PENDING)
  ├─ For each formula material:
  │  └─ AllocateWithFEFO()
  │     ├─ Get approved inventory sorted by expiry date (earliest first)
  │     ├─ Reserve quantities in FEFO order
  │     └─ Create allocations with sequence numbers
  └─ Audit log: BC created with allocations
```

### 🏭 Step 5: Production Execution
```
ReleaseBatchCard() → status = RELEASED
StartProduction() → status = IN_PRODUCTION
LogMaterialConsumption()
  ├─ Update inventory_lot (quantity_on_hand -)
  ├─ Mark as CONSUMED when empty
  └─ Track consumption by lot (traceability)
CompleteProduction()
  ├─ Calculate yield %
  ├─ FinishedGoodsBatch created (state = QUARANTINE)
  └─ status = PRODUCTION_COMPLETE
```

### ✅ Step 6: QC Gate 2 (Outgoing Inspection)
```
PerformOutgoingQC()
  ├─ Test FG parameters
  └─ Result: PASSED or FAILED

ApproveQCTest()
  ├─ If PASSED:
  │  └─ FG → APPROVED (ready for dispatch)
  └─ If FAILED:
     └─ FG → REJECTED (batch scrapped)
```

### 📤 Step 7: Dispatch & Store Issue
```
CreateDeliveryAndIssueVoucher()
  ├─ DeliveryNote created
  ├─ StoreIssueVoucher created (official dispatch)
  ├─ FG → DISPATCHED
  ├─ GenerateCertificateOfAnalysis()
  └─ Complete traceability recorded
```

---

## 🔗 Traceability Implementation

### Forward Traceability (Material → Product)
```sql
SELECT raw_material → inventory_lot → batch_card_allocation 
       → batch_card → production_execution → finished_goods_batch
```

### Reverse Traceability (Product → Material)
```sql
SELECT finished_goods_batch → production_execution → batch_card
       → batch_card_allocation → inventory_lot → raw_material_batch
```

### Full Journey
```
RM Batch → GRN → QC Test (QUARANTINE/APPROVED)
       → Inventory Lot (FEFO tracked)
       → Batch Card Allocation (earliest expiry first)
       → Production Consumption (lot-level tracking)
       → Finished Goods (QUARANTINE)
       → QC Test (APPROVED/REJECTED)
       → Delivery Note + COA
       → Audit Log (every step)
```

---

## 📊 State Machines (Validated Transitions)

### RawMaterialStateMachine
```
QUARANTINE ──approved──> APPROVED ──allocated──> ALLOCATED ──consumed──> CONSUMED
           ──rejected──> REJECTED
           ──expired───> EXPIRED
           ──scrap────> SCRAP
```

### InventoryLotStateMachine (FEFO)
```
QUARANTINE ──approved──> APPROVED ──allocated──> ALLOCATED ──consumed──> CONSUMED
           ──rejected──> REJECTED
           ──expired───> EXPIRED
```
**FEFO Logic**: `sortByFEFO()` orders by expiry_date ASC

### BatchCardStateMachine (9 states)
```
PENDING ──released──> RELEASED ──production_start──> IN_PRODUCTION
      ──production_complete──> PRODUCTION_COMPLETE
      ──fg_qc_pending──> FG_QC_PENDING
      ──fg_approved──> FG_APPROVED (or FG_REJECTED)
      ──ready_to_dispatch──> READY_TO_DISPATCH
      ──completed──> COMPLETED
```
**Yield Tracking**: `calculateYieldPercent()` = (actual_qty / theoretical_qty) × 100

### FinishedGoodsStateMachine
```
QUARANTINE ──approved──> APPROVED ──allocated──> ALLOCATED
         ──dispatched──> DISPATCHED
         ──returned───> RETURNED
```

---

## 🔐 API Summary (80+ Endpoints)

### Authentication (3)
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/profile`

### Procurement (6)
- `POST /procurement/purchase-orders`
- `GET /procurement/purchase-orders`
- `POST /procurement/goods-receipt` ← **Creates QUARANTINE**

### Quality Control (5)
- `POST /qc/incoming-test` ← **QC Gate 1**
- `POST /qc/outgoing-test` ← **QC Gate 2**
- `POST /qc/approve` ← **Executes state transition**
- `GET /qc/pending`
- `GET /qc/history/:entityId`

### Inventory (8)
- `GET /inventory/summary`
- `GET /inventory/material/:id/available`
- `POST /inventory/allocate-fefo` ← **FEFO algorithm**
- `GET /inventory/expiry-alerts`
- `GET /inventory/expired`
- `POST /inventory/auto-expire`
- `GET /inventory/fefo-analysis/:materialId`
- `GET /inventory/health`

### Production (10)
- `POST /production/batch-cards` ← **FEFO allocation**
- `POST /production/batch-cards/:id/release`
- `POST /production/batch-cards/:id/start`
- `POST /production/log-consumption`
- `POST /production/batch-cards/:id/complete`
- `GET /production/dashboard`
- `GET /production/history`
- `GET /production/batch-cards/:id/consumption-report`
- `GET /production/yield-analysis`
- `GET /production/low-yield-batches`

### Dispatch (4)
- `POST /dispatch/delivery-note`
- `GET /dispatch/delivery-notes`
- `POST /finished-goods/:id/generate-coa`
- `GET /finished-goods/:id/coa`

### Traceability (3)
- `GET /traceability/product/:fgBatchId` ← **Forward trace**
- `GET /traceability/reverse/:materialBatchId` ← **Reverse trace**
- `GET /traceability/material-journey/:materialBatchId`

### Reports (8)
- `GET /reports/production-summary`
- `GET /reports/quality-performance`
- `GET /reports/sales-performance`
- `GET /reports/procurement`
- `GET /reports/inventory-aging`
- `GET /reports/supplier-quality`
- `GET /reports/batch-card-summary/:soId`
- `GET /reports/coa/:fgBatchId`

### Audit Logs (3)
- `GET /audit-logs`
- `GET /audit-logs/entity/:entityId`
- `GET /audit-logs/summary`

**Plus**: Sales Orders, Master Data, and other endpoints

---

## 🎯 Implementation Roadmap

### Phase 1: Database Migration (Critical)
```
1. ✅ Prisma schema designed (schema_iso9001.prisma)
2. ⏳ Run migration: npx prisma migrate dev
3. ⏳ Seed master data
4. ⏳ Verify relationships and indexes
```

### Phase 2: Service Layer Implementation (High Priority)
```
1. ✅ TraceabilityService (7-step workflow)
2. ✅ QualityControlService (QC gates)
3. ✅ ProductionService (execution & yield)
4. ✅ InventoryService (FEFO allocation)
5. ✅ ReportsService (traceability & analytics)
```

### Phase 3: API Routes & Controllers
```
1. Create all route files
2. Create all controller functions
3. Wire up services to controllers
4. Add input validation
5. Add error handling
```

### Phase 4: Frontend Integration
```
1. QC Test pages with parameter entry
2. Batch Card generation with FEFO visualization
3. Production execution dashboard
4. Yield analysis reports
5. Traceability viewer
6. COA generator
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Setup Database
```bash
# Copy environment variables
cp backend/.env.example backend/.env

# Apply ISO 9001 schema
cd backend
npx prisma migrate dev --name iso9001_schema
```

### 3. Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: Supabase

### 5. Login
- Email: `admin@bmm.local`
- Password: `admin123`

---

## 📋 Compliance Features

✅ **ISO 9001 Compliance**
- QC gates at receiving and dispatch
- Comprehensive audit logs (all state changes)
- Traceability (forward & reverse)
- Document control (GRN, COA, SIV)
- Supplier quality metrics
- Non-conformance tracking

✅ **FEFO Inventory**
- Expiry date tracking
- Automatic expiry marking
- FEFO allocation algorithm
- Inventory aging reports
- Expiry alerts (30 days)

✅ **Production Control**
- Batch card with formula tracking
- Material consumption logging
- Yield calculation & variance analysis
- Low yield batch identification

✅ **Traceability**
- Forward trace (RM → Product)
- Reverse trace (Product → RM)
- Material journey tracking
- Complete audit trail

---

## 📞 Support

For detailed API documentation, see: [API_ROUTES.md](./routes/API_ROUTES.md)

For state machine logic, see: [stateMachines.ts](./utils/stateMachines.ts)

For database schema, see: [schema_iso9001.prisma](./prisma/schema_iso9001.prisma)
