-- Migration: Add missing columns to delivery_notes and sales_orders tables for ISO compliance

-- Add missing columns to sales_orders table
ALTER TABLE sales_orders 
  ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;

-- Add missing columns to delivery_notes table  
ALTER TABLE delivery_notes
  ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS delivered_date DATE,
  ADD COLUMN IF NOT EXISTS remarks TEXT,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_notes_delivered_by ON delivery_notes(delivered_by);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_delivered_date ON delivery_notes(delivered_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date);

-- Update existing delivery_notes to have sensible defaults if columns were added
UPDATE delivery_notes 
SET delivered_date = COALESCE(delivered_date, delivery_date, CURRENT_DATE)
WHERE delivered_date IS NULL;

-- Verify tables and columns exist
SELECT 'Migration 003 completed successfully' as status;
