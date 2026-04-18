-- ============================================================================
-- ISO 9001 Manufacturing ERP - FRESH MIGRATION
-- Supabase SQL - Complete Drop and Rebuild (CLEAN SLATE)
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL EXISTING OBJECTS (SAFE CASCADE)
-- ============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS certificates_of_analysis CASCADE;
DROP TABLE IF EXISTS store_issue_vouchers CASCADE;
DROP TABLE IF EXISTS delivery_note_items CASCADE;
DROP TABLE IF EXISTS delivery_notes CASCADE;
DROP TABLE IF EXISTS production_logs CASCADE;
DROP TABLE IF EXISTS production_execution CASCADE;
DROP TABLE IF EXISTS finished_goods_batches CASCADE;
DROP TABLE IF EXISTS batch_card_allocations CASCADE;
DROP TABLE IF EXISTS batch_card_formulas CASCADE;
DROP TABLE IF EXISTS batch_cards CASCADE;
DROP TABLE IF EXISTS qc_test_results CASCADE;
DROP TABLE IF EXISTS sales_order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS inventory_lots CASCADE;
DROP TABLE IF EXISTS raw_material_batches CASCADE;
DROP TABLE IF EXISTS grn_items CASCADE;
DROP TABLE IF EXISTS goods_receipt_notes CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS raw_material_status CASCADE;
DROP TYPE IF EXISTS inventory_state CASCADE;
DROP TYPE IF EXISTS purchase_order_status CASCADE;
DROP TYPE IF EXISTS grn_status CASCADE;
DROP TYPE IF EXISTS qc_result CASCADE;
DROP TYPE IF EXISTS sales_order_status CASCADE;
DROP TYPE IF EXISTS batch_card_status CASCADE;
DROP TYPE IF EXISTS finished_goods_state CASCADE;
DROP TYPE IF EXISTS delivery_note_status CASCADE;

-- ============================================================================
-- STEP 2: CREATE ENUMS
-- ============================================================================

CREATE TYPE raw_material_status AS ENUM (
  'QUARANTINE',
  'APPROVED',
  'ALLOCATED',
  'CONSUMED',
  'REJECTED',
  'EXPIRED',
  'SCRAP'
);

CREATE TYPE inventory_state AS ENUM (
  'QUARANTINE',
  'APPROVED',
  'ALLOCATED',
  'CONSUMED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE purchase_order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'RECEIVED',
  'COMPLETE',
  'CANCELLED'
);

CREATE TYPE grn_status AS ENUM (
  'RECEIVED',
  'QC_PENDING',
  'QC_APPROVED',
  'QC_REJECTED'
);

CREATE TYPE qc_result AS ENUM (
  'PASSED',
  'FAILED'
);

CREATE TYPE sales_order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_TO_DISPATCH',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE batch_card_status AS ENUM (
  'PENDING',
  'RELEASED',
  'IN_PRODUCTION',
  'PRODUCTION_COMPLETE',
  'FG_QC_PENDING',
  'FG_APPROVED',
  'FG_REJECTED',
  'READY_TO_DISPATCH',
  'COMPLETED'
);

CREATE TYPE finished_goods_state AS ENUM (
  'QUARANTINE',
  'APPROVED',
  'ALLOCATED',
  'DISPATCHED',
  'RETURNED'
);

CREATE TYPE delivery_note_status AS ENUM (
  'PENDING',
  'DISPATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
);

-- ============================================================================
-- STEP 3: CREATE MASTER DATA TABLES
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(10),
  payment_terms VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT suppliers_email_unique UNIQUE (email)
);

CREATE TABLE raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(20),
  minimum_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT customers_email_unique UNIQUE (email)
);

-- ============================================================================
-- STEP 4: CREATE PROCUREMENT TABLES
-- ============================================================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  expected_delivery_date DATE,
  status purchase_order_status DEFAULT 'PENDING',
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES raw_materials(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE goods_receipt_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number VARCHAR(50) NOT NULL UNIQUE,
  po_id UUID REFERENCES purchase_orders(id),
  status grn_status DEFAULT 'RECEIVED',
  received_by UUID REFERENCES users(id),
  received_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grn_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES raw_materials(id),
  quantity_received INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: CREATE INVENTORY TABLES
-- ============================================================================

CREATE TABLE raw_material_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  material_id UUID NOT NULL REFERENCES raw_materials(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  po_id UUID REFERENCES purchase_orders(id),
  manufacturing_date DATE,
  expiry_date DATE,
  quantity_received INT NOT NULL,
  status raw_material_status DEFAULT 'QUARANTINE',
  qc_approved_date TIMESTAMP,
  qc_approved_by UUID REFERENCES users(id),
  qc_rejected_date TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number VARCHAR(50) NOT NULL UNIQUE,
  material_batch_id UUID NOT NULL REFERENCES raw_material_batches(id) ON DELETE CASCADE,
  state inventory_state DEFAULT 'QUARANTINE',
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_consumed INT DEFAULT 0,
  quarantine_date TIMESTAMP DEFAULT NOW(),
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE QUALITY CONTROL TABLE
-- ============================================================================

CREATE TABLE qc_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number VARCHAR(50) NOT NULL UNIQUE,
  material_batch_id UUID REFERENCES raw_material_batches(id) ON DELETE SET NULL,
  fg_batch_id UUID,
  test_parameters JSONB,
  results JSONB,
  result qc_result,
  test_type VARCHAR(50),
  tested_by UUID REFERENCES users(id),
  approval_decision VARCHAR(50),
  comments TEXT,
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: CREATE SALES TABLES
-- ============================================================================

CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  delivery_date DATE,
  status sales_order_status DEFAULT 'PENDING',
  total_amount DECIMAL(12,2),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: CREATE PRODUCTION TABLES
-- ============================================================================

CREATE TABLE batch_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_number VARCHAR(50) NOT NULL UNIQUE,
  so_id UUID NOT NULL REFERENCES sales_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  planned_quantity INT NOT NULL,
  theoretical_yield INT NOT NULL,
  actual_quantity INT,
  scrap_quantity INT,
  yield_percent DECIMAL(5,2),
  status batch_card_status DEFAULT 'PENDING',
  released_date TIMESTAMP,
  released_by UUID REFERENCES users(id),
  production_start TIMESTAMP,
  production_end TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE batch_card_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL REFERENCES batch_cards(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES raw_materials(id),
  material_batch_id UUID REFERENCES raw_material_batches(id),
  quantity INT NOT NULL,
  scrap_percent DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE batch_card_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL REFERENCES batch_cards(id) ON DELETE CASCADE,
  inventory_lot_id UUID NOT NULL REFERENCES inventory_lots(id),
  allocated_quantity INT NOT NULL,
  consumed_quantity INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ALLOCATED',
  allocation_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE production_execution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL REFERENCES batch_cards(id),
  status VARCHAR(50) DEFAULT 'INITIATED',
  operator_id UUID REFERENCES users(id),
  shift_number VARCHAR(50),
  start_date TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL REFERENCES batch_cards(id),
  inventory_lot_id UUID NOT NULL REFERENCES inventory_lots(id),
  quantity_consumed INT NOT NULL,
  logged_by UUID REFERENCES users(id),
  logged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE finished_goods_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fg_batch_number VARCHAR(50) NOT NULL UNIQUE,
  production_execution_id UUID REFERENCES production_execution(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_produced INT NOT NULL,
  scrap_quantity INT DEFAULT 0,
  quantity_dispatched INT DEFAULT 0,
  production_date TIMESTAMP DEFAULT NOW(),
  expiry_date DATE,
  state finished_goods_state DEFAULT 'QUARANTINE',
  qc_status VARCHAR(50) DEFAULT 'PENDING',
  qc_approved_date TIMESTAMP,
  qc_approved_by UUID REFERENCES users(id),
  qc_rejected_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 9: CREATE DISPATCH TABLES
-- ============================================================================

CREATE TABLE delivery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dn_number VARCHAR(50) NOT NULL UNIQUE,
  so_id UUID NOT NULL REFERENCES sales_orders(id),
  status delivery_note_status DEFAULT 'PENDING',
  created_by UUID REFERENCES users(id),
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE delivery_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dn_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  fg_batch_id UUID NOT NULL REFERENCES finished_goods_batches(id),
  quantity_dispatched INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE store_issue_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siv_number VARCHAR(50) NOT NULL UNIQUE,
  dn_id UUID NOT NULL REFERENCES delivery_notes(id),
  fg_batch_id UUID NOT NULL REFERENCES finished_goods_batches(id),
  quantity_issued INT NOT NULL,
  issued_by UUID REFERENCES users(id),
  issued_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE certificates_of_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coa_number VARCHAR(50) NOT NULL UNIQUE,
  fg_batch_id UUID NOT NULL REFERENCES finished_goods_batches(id),
  test_results JSONB,
  certified_by UUID REFERENCES users(id),
  certification_date TIMESTAMP DEFAULT NOW(),
  test_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 10: CREATE AUDIT TABLE
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 11: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at);

CREATE INDEX idx_raw_material_batches_material_id ON raw_material_batches(material_id);
CREATE INDEX idx_raw_material_batches_supplier_id ON raw_material_batches(supplier_id);
CREATE INDEX idx_raw_material_batches_status ON raw_material_batches(status);
CREATE INDEX idx_raw_material_batches_expiry_date ON raw_material_batches(expiry_date);

CREATE INDEX idx_inventory_lots_state ON inventory_lots(state);
CREATE INDEX idx_inventory_lots_material_batch_id ON inventory_lots(material_batch_id);

CREATE INDEX idx_batch_cards_so_id ON batch_cards(so_id);
CREATE INDEX idx_batch_cards_status ON batch_cards(status);
CREATE INDEX idx_batch_cards_product_id ON batch_cards(product_id);

CREATE INDEX idx_batch_card_allocations_batch_card_id ON batch_card_allocations(batch_card_id);
CREATE INDEX idx_batch_card_allocations_inventory_lot_id ON batch_card_allocations(inventory_lot_id);

CREATE INDEX idx_finished_goods_batches_state ON finished_goods_batches(state);
CREATE INDEX idx_finished_goods_batches_product_id ON finished_goods_batches(product_id);

CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);

CREATE INDEX idx_qc_test_results_result ON qc_test_results(result);
CREATE INDEX idx_qc_test_results_created_at ON qc_test_results(created_at);

CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- STEP 12: SEED DEFAULT ADMIN USER
-- ============================================================================

INSERT INTO users (name, email, password_hash, role, department, is_active)
VALUES (
  'Admin User',
  'admin@bmm.local',
  '$2b$10$QIvFJM3MHzHOVOvF7eB3/.3T6KK0.y50DRy.KvjKT.K6Q6/r2YVPO',
  'admin',
  'Administration',
  true
);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Status: FRESH MIGRATION - ALL TABLES DROPPED AND RECREATED
-- Tables Created: 25
-- Enums Created: 8
-- Indexes Created: 15+
-- Total Relations: 40+
-- Default Admin: admin@bmm.local / admin123
-- 
-- Ready for ISO 9001 Manufacturing ERP operations
-- ============================================================================
