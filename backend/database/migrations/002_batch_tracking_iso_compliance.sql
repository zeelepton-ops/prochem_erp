-- Migration: Add batch tracking and ISO compliance features

-- Add new columns to suppliers table for ISO compliance
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS iso_certified BOOLEAN DEFAULT false;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS vendor_status VARCHAR(50) DEFAULT 'PENDING_AUDIT';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS last_audit_date DATE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS next_audit_due DATE;

-- Add new columns to users table for accountability
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;

-- Create raw_materials table (replacing simple inventory)
CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50),
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create material_batches table for batch tracking
CREATE TABLE IF NOT EXISTS material_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  received_date DATE NOT NULL,
  expiry_date DATE,
  quantity DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUARANTINE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(material_id, batch_number)
);

-- Update material_tests table for accountability
ALTER TABLE material_tests ADD COLUMN IF NOT EXISTS sampled_by UUID REFERENCES users(id);
ALTER TABLE material_tests ADD COLUMN IF NOT EXISTS tested_by UUID REFERENCES users(id);
ALTER TABLE material_tests ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE material_tests ADD COLUMN IF NOT EXISTS equipment_used VARCHAR(255);
ALTER TABLE material_tests ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES material_batches(id);

-- Update delivery_notes table structure
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES users(id);
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS delivered_date DATE;
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE delivery_notes ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2);

-- Create delivery_note_items table
CREATE TABLE IF NOT EXISTS delivery_note_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dn_id UUID REFERENCES delivery_notes(id) ON DELETE CASCADE,
  so_item_id UUID,
  product_name VARCHAR(255) NOT NULL,
  quantity_delivered DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery_batch_allocations table for forward traceability
CREATE TABLE IF NOT EXISTS delivery_batch_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dn_item_id UUID REFERENCES delivery_note_items(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES material_batches(id),
  batch_number VARCHAR(100) NOT NULL,
  allocated_quantity DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create production_batches table for production tracking
CREATE TABLE IF NOT EXISTS production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_card_number VARCHAR(100) UNIQUE NOT NULL,
  target_product VARCHAR(255) NOT NULL,
  target_quantity DECIMAL(10,2) NOT NULL,
  target_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'PLANNED',
  theoretical_yield DECIMAL(10,2),
  actual_yield DECIMAL(10,2),
  scrap_loss DECIMAL(10,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create production_batch_raw_materials table for raw material allocation
CREATE TABLE IF NOT EXISTS production_batch_raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES material_batches(id),
  batch_number VARCHAR(100) NOT NULL,
  allocated_quantity DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing inventory data to new structure
INSERT INTO raw_materials (code, name, description, unit_of_measure, minimum_stock, reorder_level)
SELECT
  REPLACE(LOWER(REPLACE(material_name, ' ', '_')), '[^a-z0-9_]', '') || '_' || id as code,
  material_name as name,
  'Migrated from inventory' as description,
  unit_of_measure,
  reorder_level as minimum_stock,
  reorder_level
FROM inventory
ON CONFLICT (code) DO NOTHING;

-- Migrate inventory quantities to default batches
INSERT INTO material_batches (material_id, batch_number, received_date, expiry_date, quantity, status)
SELECT
  rm.id,
  'MIGRATED-' || rm.code || '-001' as batch_number,
  CURRENT_DATE as received_date,
  CURRENT_DATE + INTERVAL '1 year' as expiry_date,
  i.quantity_on_hand as quantity,
  'APPROVED' as status
FROM raw_materials rm
JOIN inventory i ON rm.name = i.material_name
WHERE i.quantity_on_hand > 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_batches_material_id ON material_batches(material_id);
CREATE INDEX IF NOT EXISTS idx_material_batches_status ON material_batches(status);
CREATE INDEX IF NOT EXISTS idx_material_batches_expiry ON material_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_delivery_note_items_dn_id ON delivery_note_items(dn_id);
CREATE INDEX IF NOT EXISTS idx_delivery_batch_allocations_dn_item_id ON delivery_batch_allocations(dn_item_id);
CREATE INDEX IF NOT EXISTS idx_delivery_batch_allocations_batch_id ON delivery_batch_allocations(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batch_raw_materials_batch_id ON production_batch_raw_materials(production_batch_id);

-- Update existing delivery notes to have default values
UPDATE delivery_notes SET
  delivered_date = delivery_date::date,
  delivered_by = created_by,
  total_amount = 0
WHERE delivered_date IS NULL;