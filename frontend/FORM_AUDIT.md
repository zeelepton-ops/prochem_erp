# UI FORM COMPLETENESS AUDIT & FIELD MAPPING

## Summary
All create/edit forms are **significantly incomplete**. Missing many required fields that are essential for ISO 9001 compliance tracking and business operations.

---

## 1. PURCHASE ORDERS MODULE

### Database Schema (purchase_orders table)
```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  po_number VARCHAR(50) NOT NULL UNIQUE,          ✓ NEW FORM HAS
  supplier_id UUID NOT NULL,                       ✓ NEW FORM HAS
  expected_delivery_date DATE,                     ✓ NEW FORM HAS
  status purchase_order_status DEFAULT 'PENDING', ✗ MISSING
  created_by UUID REFERENCES users(id),           ✗ MISSING
  updated_by UUID REFERENCES users(id),           ✗ MISSING
  created_at TIMESTAMP DEFAULT NOW(),             ✗ SYSTEM
  updated_at TIMESTAMP DEFAULT NOW()              ✗ SYSTEM
);
```

### Form Comparison

**OLD CreatePurchaseOrderPage:**
- supplierId ✓
- expectedDeliveryDate ✓
- totalAmount ✗ (NOT IN SCHEMA!)

**NEW CreatePurchaseOrderPageV2:**
- ✓ poNumber
- ✓ supplierId (with dropdown)
- ✓ expectedDeliveryDate
- ✓ notes (for special instructions)
- ✓ Line items with materials, quantity, price
- ✓ Total calculation
- ⚠ Still missing: status (should default to PENDING), created_by (should auto from user)

### Missing Fields to Address
1. **Status** - Should auto-default to 'PENDING' in form submission
2. **created_by/updated_by** - Should capture from authenticated user
3. **Line Items** - Purchase order items table has these required fields:
   - material_id ✓
   - quantity ✓
   - unit_price ✓
   - line_total (calculated) ✓

### NEW FORM IMPLEMENTATION
✓ Complete - CreatePurchaseOrderPageV2.tsx created with all fields

---

## 2. SALES ORDERS MODULE

### Database Schema (sales_orders table)
```sql
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY,
  so_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  expected_delivery_date DATE,
  status sales_order_status DEFAULT 'PENDING',
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY,
  so_id UUID NOT NULL REFERENCES sales_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(12,2)
);
```

### Current Form Issues
**OLD CreateSalesOrderPage:**
- customerId
- expectedDeliveryDate
- totalAmount (not in schema)

**MISSING:**
- ✗ SO number
- ✗ Line items with products
- ✗ Quantity per product
- ✗ Unit pricing
- ✗ Status tracking
- ✗ User tracking

### Required Fixes
1. Auto-generate SO number
2. Add product dropdown selection
3. Implement line items table
4. Add status field (default: PENDING)
5. Add customer dropdown (not raw ID)

---

## 3. PRODUCTION/BATCH CARDS

### Database Schema (batch_cards table)
```sql
CREATE TABLE batch_cards (
  id UUID PRIMARY KEY,
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_planned INT NOT NULL,
  quantity_produced INT DEFAULT 0,
  status batch_card_status DEFAULT 'PLANNED',
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Current Form Issues
**CreateProductionPage:**
- productId (only one, no multi-select)
- quantityPlanned
- plannedStartDate
- plannedEndDate

**MISSING:**
- ✗ Batch number (auto-generation)
- ✗ Quantity produced (initially 0)
- ✗ Status tracking (should be PLANNED)
- ✗ Actual dates (filled during production)
- ✗ Created_by/updated_by tracking
- ✗ Formula/recipe reference (from products)

### Required Fixes
1. Add batch number auto-generation/display
2. Add formula/recipe reference
3. Show quantity produced field (initially 0, auto-updated)
4. Add status display (PLANNED → IN_PROGRESS → COMPLETED)
5. Add form for updating actual dates during production

---

## 4. MATERIAL TESTS / QC

### Database Schema (qc_test_results table)
```sql
CREATE TABLE qc_test_results (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batch_cards(id),
  test_type VARCHAR(100),
  result_value DECIMAL(10,2),
  test_parameters JSON,
  status qc_status DEFAULT 'PENDING',
  tested_by UUID REFERENCES users(id),
  tested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE material_tests (
  id UUID PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES raw_materials(id),
  grn_id UUID REFERENCES goods_receipt_notes(id),
  test_type material_test_type DEFAULT 'TENSILE_STRENGTH',
  result_value DECIMAL(10,2),
  test_parameters JSON,
  status material_test_status DEFAULT 'PENDING',
  tested_by UUID REFERENCES users(id),
  tested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Current Form Issues
**CreateMaterialTestPage:**
- materialId
- testType
- resultValue

**MISSING:**
- ✗ Test parameters (JSON, varies by test type)
- ✗ Status tracking (PENDING → PASSED → FAILED)
- ✗ Tested_by user tracking
- ✗ Tested_at timestamp
- ✗ GRN reference (for incoming material tests)
- ✗ Batch reference (for production QC)
- ✗ Pass/fail criteria validation
- ✗ Remarks/notes field

### Required Fixes
1. Create dynamic test parameters based on test type
2. Add status field (PENDING/PASSED/FAILED/QUARANTINED)
3. Add tested_by automatic from auth user
4. Add tested_at timestamp
5. Add notes/remarks for test results
6. Add pass/fail criteria display
7. Create separate flows for material testing vs batch QC

---

## 5. DELIVERY NOTES

### Database Schema (delivery_notes table)
```sql
CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY,
  dn_number VARCHAR(50) NOT NULL UNIQUE,
  so_id UUID REFERENCES sales_orders(id),
  delivered_by UUID REFERENCES users(id),
  delivered_date TIMESTAMP,
  status delivery_note_status DEFAULT 'PENDING',
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE delivery_note_items (
  id UUID PRIMARY KEY,
  dn_id UUID NOT NULL REFERENCES delivery_notes(id),
  so_item_id UUID REFERENCES sales_order_items(id),
  quantity_delivered INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Current Form Issues
**CreateDeliveryNotePage:**
- Only basic fields
- No SO reference
- No line items

**MISSING:**
- ✗ DN number
- ✗ Sales order reference
- ✗ Line items from SO
- ✗ Quantity tracking per item
- ✗ Delivered by user
- ✗ Delivered date/time
- ✗ Status (PENDING → DELIVERED → CONFIRMED)
- ✗ Digital signature/proof
- ✗ Recipient tracking

### Required Fixes
1. Link to existing sales order
2. Pull line items from selected SO
3. Add quantity delivered per item
4. Add delivered_by user selection
5. Add delivered_date timestamp
6. Add status tracking
7. Add remarks/special delivery notes

---

## 6. INVENTORY MANAGEMENT

### Database Schema (raw_materials, products, inventory)
```sql
CREATE TABLE raw_materials (
  id UUID PRIMARY KEY,
  material_code VARCHAR(50) NOT NULL UNIQUE,
  material_name VARCHAR(255) NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  uom VARCHAR(20),
  min_stock_level INT,
  reorder_quantity INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  material_id UUID REFERENCES raw_materials(id),
  product_id UUID REFERENCES products(id),
  batch_id VARCHAR(50),
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_available INT GENERATED,
  warehouse_location VARCHAR(100),
  last_count_date DATE,
  updated_at TIMESTAMP
);
```

### Current Form Issues
**No dedicated inventory adjustment form**

**MISSING:**
- ✗ Stock receipt form
- ✗ Stock issuance form
- ✗ Inventory adjustment form
- ✗ Physical count form
- ✗ Batch tracking
- ✗ Expiry date management
- ✗ Warehouse location management
- ✗ Movement history

### Required Fixes
1. Create stock receipt form
2. Create stock issuance form
3. Create physical count form
4. Add batch/lot tracking
5. Add expiry date handling
6. Add warehouse location management

---

## IMPLEMENTATION PRIORITY

### Phase 1 (CRITICAL - Data Capture)
1. ✓ CreatePurchaseOrderPageV2.tsx - Recreated with full fields
2. CreateSalesOrderPageV2.tsx - Sales orders with line items
3. CreateDeliveryNotePageV2.tsx - Link to SO with line item tracking
4. CreateProductionPageV2.tsx - Batch tracking with dates
5. CreateMaterialTestPageV2.tsx - Test parameters and status

### Phase 2 (IMPORTANT - Business Logic)
1. Inventory adjustment forms
2. GRN receiving form with quality check
3. Stock count forms
4. QC approval workflows

### Phase 3 (NICE TO HAVE)
1. Dashboard analytics
2. Report generation
3. Audit trail display

---

## FIELD VALIDATION RULES

### PURCHASE ORDERS
- PO Number: Auto-generated, format: PO-YYYYMMDD-XXXXX
- Supplier: Required, must be from suppliers table
- Expected Delivery: Required, must be future date
- Line Items: At least 1 required, qty & price > 0
- Status: Auto = 'PENDING'

### SALES ORDERS
- SO Number: Auto-generated, format: SO-YYYYMMDD-XXXXX
- Customer: Required, must be from customers table
- Line Items: At least 1 required, qty & price > 0
- Expected Delivery: Required, must be future date
- Status: Auto = 'PENDING'

### PRODUCTION BATCH
- Batch Number: Auto-generated, format: BATCH-YYYYMMDD-XXXXX
- Product: Required, must exist
- Quantity Planned: Required, > 0
- Dates: End date > start date
- Status: Auto = 'PLANNED'

### MATERIAL TESTS
- Material/Batch: Required reference
- Test Type: Required, from enum
- Result Value: Numeric, required
- Test Parameters: Varies by type (JSON)
- Status: Validates against pass/fail criteria

### DELIVERY NOTES
- DN Number: Auto-generated
- SO Reference: Required for SO delivery
- Line Items: Must match SO items
- Delivered By: Required user reference
- Delivered Date: Required timestamp

---

## NOTES

All forms need:
1. **User Context** - Capture created_by from authenticated user
2. **Timestamps** - Auto-capture created_at, updated_at
3. **Status Defaults** - Auto-set initial status from enum defaults
4. **Validation** - Strong input validation before submission
5. **Error Display** - Clear error messages with field highlighting
6. **Loading States** - Disable form during submission
7. **Success Feedback** - Show confirmation after creation
