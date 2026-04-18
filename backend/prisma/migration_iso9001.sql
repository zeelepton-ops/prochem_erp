-- ============================================================================
-- ISO 9001 Manufacturing ERP - Complete Database Migration
-- Supabase SQL - Run this directly in Supabase SQL Editor
-- ============================================================================

-- Drop existing tables if they exist (WARNING: This will delete existing data)
-- Uncomment only if you want to start fresh
/*
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
*/

-- ============================================================================
-- CREATE ENUMS (with IF NOT EXISTS safety)
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'raw_material_status') THEN
    CREATE TYPE raw_material_status AS ENUM (
      'QUARANTINE',
      'APPROVED',
      'ALLOCATED',
      'CONSUMED',
      'REJECTED',
      'EXPIRED',
      'SCRAP'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_state') THEN
    CREATE TYPE inventory_state AS ENUM (
      'QUARANTINE',
      'APPROVED',
      'ALLOCATED',
      'CONSUMED',
      'REJECTED',
      'EXPIRED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_order_status') THEN
    CREATE TYPE purchase_order_status AS ENUM (
      'PENDING',
      'CONFIRMED',
      'RECEIVED',
      'COMPLETE',
      'CANCELLED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grn_status') THEN
    CREATE TYPE grn_status AS ENUM (
      'RECEIVED',
      'QC_PENDING',
      'QC_APPROVED',
      'QC_REJECTED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'qc_result') THEN
    CREATE TYPE qc_result AS ENUM (
      'PASSED',
      'FAILED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_order_status') THEN
    CREATE TYPE sales_order_status AS ENUM (
      'PENDING',
      'CONFIRMED',
      'IN_PRODUCTION',
      'READY_TO_DISPATCH',
      'DISPATCHED',
      'DELIVERED',
      'CANCELLED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_card_status') THEN
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'finished_goods_state') THEN
    CREATE TYPE finished_goods_state AS ENUM (
      'QUARANTINE',
      'APPROVED',
      'ALLOCATED',
      'DISPATCHED',
      'RETURNED'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_note_status') THEN
    CREATE TYPE delivery_note_status AS ENUM (
      'PENDING',
      'DISPATCHED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    );
  END IF;
END $$;

-- ============================================================================
-- CREATE MASTER DATA TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
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
  created_by UUID,
  CONSTRAINT suppliers_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(20),
  minimum_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT raw_materials_code_unique UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
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

CREATE TABLE IF NOT EXISTS users (
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

-- ============================================================================
-- CREATE PROCUREMENT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL,
  expected_delivery_date DATE,
  status purchase_order_status DEFAULT 'PENDING',
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT purchase_orders_po_number_unique UNIQUE (po_number)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS goods_receipt_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number VARCHAR(50) NOT NULL UNIQUE,
  po_id UUID,
  status grn_status DEFAULT 'RECEIVED',
  received_by UUID,
  received_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (received_by) REFERENCES users(id),
  CONSTRAINT goods_receipt_notes_grn_number_unique UNIQUE (grn_number)
);

CREATE TABLE IF NOT EXISTS grn_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL,
  material_id UUID NOT NULL,
  quantity_received INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- ============================================================================
-- CREATE INVENTORY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS raw_material_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) NOT NULL UNIQUE,
  material_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  po_id UUID,
  manufacturing_date DATE,
  expiry_date DATE,
  quantity_received INT NOT NULL,
  status raw_material_status DEFAULT 'QUARANTINE',
  qc_approved_date TIMESTAMP,
  qc_approved_by UUID,
  qc_rejected_date TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (qc_approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT raw_material_batches_batch_number_unique UNIQUE (batch_number)
);

CREATE TABLE IF NOT EXISTS inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number VARCHAR(50) NOT NULL UNIQUE,
  material_batch_id UUID NOT NULL,
  state inventory_state DEFAULT 'QUARANTINE',
  quantity_on_hand INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_consumed INT DEFAULT 0,
  quarantine_date TIMESTAMP DEFAULT NOW(),
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (material_batch_id) REFERENCES raw_material_batches(id) ON DELETE CASCADE,
  CONSTRAINT inventory_lots_lot_number_unique UNIQUE (lot_number)
);

-- ============================================================================
-- CREATE QUALITY CONTROL TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS qc_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_number VARCHAR(50) NOT NULL UNIQUE,
  material_batch_id UUID,
  fg_batch_id UUID,
  test_parameters JSONB,
  results JSONB,
  result qc_result,
  test_type VARCHAR(50), -- 'INCOMING' or 'OUTGOING'
  tested_by UUID,
  approval_decision VARCHAR(50),
  comments TEXT,
  approved_by UUID,
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (material_batch_id) REFERENCES raw_material_batches(id) ON DELETE SET NULL,
  FOREIGN KEY (tested_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT qc_test_results_test_number_unique UNIQUE (test_number)
);

-- ============================================================================
-- CREATE SALES TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  delivery_date DATE,
  status sales_order_status DEFAULT 'PENDING',
  total_amount DECIMAL(12,2),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT sales_orders_so_number_unique UNIQUE (so_number)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================================
-- CREATE PRODUCTION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_number VARCHAR(50) NOT NULL UNIQUE,
  so_id UUID NOT NULL,
  product_id UUID NOT NULL,
  planned_quantity INT NOT NULL,
  theoretical_yield INT NOT NULL,
  actual_quantity INT,
  scrap_quantity INT,
  yield_percent DECIMAL(5,2),
  status batch_card_status DEFAULT 'PENDING',
  released_date TIMESTAMP,
  released_by UUID,
  production_start TIMESTAMP,
  production_end TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (so_id) REFERENCES sales_orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (released_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT batch_cards_batch_card_number_unique UNIQUE (batch_card_number)
);

CREATE TABLE IF NOT EXISTS batch_card_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL,
  material_id UUID NOT NULL,
  material_batch_id UUID,
  quantity INT NOT NULL,
  scrap_percent DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_card_id) REFERENCES batch_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (material_batch_id) REFERENCES raw_material_batches(id)
);

CREATE TABLE IF NOT EXISTS batch_card_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL,
  inventory_lot_id UUID NOT NULL,
  allocated_quantity INT NOT NULL,
  consumed_quantity INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ALLOCATED',
  allocation_order INT, -- For FEFO: 1=earliest expiry, 2=next, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_card_id) REFERENCES batch_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_lot_id) REFERENCES inventory_lots(id)
);

CREATE TABLE IF NOT EXISTS production_execution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'INITIATED',
  operator_id UUID,
  shift_number VARCHAR(50),
  start_date TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  completed_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_card_id) REFERENCES batch_cards(id),
  FOREIGN KEY (operator_id) REFERENCES users(id),
  FOREIGN KEY (completed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_card_id UUID NOT NULL,
  inventory_lot_id UUID NOT NULL,
  quantity_consumed INT NOT NULL,
  logged_by UUID,
  logged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (batch_card_id) REFERENCES batch_cards(id),
  FOREIGN KEY (inventory_lot_id) REFERENCES inventory_lots(id),
  FOREIGN KEY (logged_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS finished_goods_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fg_batch_number VARCHAR(50) NOT NULL UNIQUE,
  production_execution_id UUID,
  product_id UUID NOT NULL,
  quantity_produced INT NOT NULL,
  scrap_quantity INT DEFAULT 0,
  quantity_dispatched INT DEFAULT 0,
  production_date TIMESTAMP DEFAULT NOW(),
  expiry_date DATE,
  state finished_goods_state DEFAULT 'QUARANTINE',
  qc_status VARCHAR(50) DEFAULT 'PENDING',
  qc_approved_date TIMESTAMP,
  qc_approved_by UUID,
  qc_rejected_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (production_execution_id) REFERENCES production_execution(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (qc_approved_by) REFERENCES users(id),
  CONSTRAINT finished_goods_batches_fg_batch_number_unique UNIQUE (fg_batch_number)
);

-- ============================================================================
-- CREATE DISPATCH TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dn_number VARCHAR(50) NOT NULL UNIQUE,
  so_id UUID NOT NULL,
  status delivery_note_status DEFAULT 'PENDING',
  created_by UUID,
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (so_id) REFERENCES sales_orders(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT delivery_notes_dn_number_unique UNIQUE (dn_number)
);

CREATE TABLE IF NOT EXISTS delivery_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dn_id UUID NOT NULL,
  fg_batch_id UUID NOT NULL,
  quantity_dispatched INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (dn_id) REFERENCES delivery_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (fg_batch_id) REFERENCES finished_goods_batches(id)
);

CREATE TABLE IF NOT EXISTS store_issue_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siv_number VARCHAR(50) NOT NULL UNIQUE,
  dn_id UUID NOT NULL,
  fg_batch_id UUID NOT NULL,
  quantity_issued INT NOT NULL,
  issued_by UUID,
  issued_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (dn_id) REFERENCES delivery_notes(id),
  FOREIGN KEY (fg_batch_id) REFERENCES finished_goods_batches(id),
  FOREIGN KEY (issued_by) REFERENCES users(id),
  CONSTRAINT store_issue_vouchers_siv_number_unique UNIQUE (siv_number)
);

CREATE TABLE IF NOT EXISTS certificates_of_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coa_number VARCHAR(50) NOT NULL UNIQUE,
  fg_batch_id UUID NOT NULL,
  test_results JSONB,
  certified_by UUID,
  certification_date TIMESTAMP DEFAULT NOW(),
  test_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (fg_batch_id) REFERENCES finished_goods_batches(id),
  FOREIGN KEY (certified_by) REFERENCES users(id),
  CONSTRAINT certificates_of_analysis_coa_number_unique UNIQUE (coa_number)
);

-- ============================================================================
-- CREATE AUDIT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATE_CHANGE, APPROVE, REJECT
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
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
-- CREATE DEFAULT ADMIN USER (if users table is empty)
-- ============================================================================

INSERT INTO users (name, email, password_hash, role, department, is_active)
SELECT 
  'Admin User',
  'admin@bmm.local',
  '$2b$10$QIvFJM3MHzHOVOvF7eB3/.3T6KK0.y50DRy.KvjKT.K6Q6/r2YVPO', -- hashed 'admin123'
  'admin',
  'Administration',
  true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bmm.local');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables Created: 25
-- Enums Created: 8
-- Indexes Created: 15+
-- Total Relations: 40+
-- 
-- Ready for ISO 9001 Manufacturing ERP operations
-- ============================================================================
