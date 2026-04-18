// ============================================================================
// REPORTS SERVICE
// Traceability reports, COA generation, and analytics
// ============================================================================

import { db } from '../config/database';

export class ReportsService {
  /**
   * Product Traceability Report
   * Forward traceability: From raw materials to finished goods
   */
  async getProductTraceability(fgBatchId: string) {
    const traceability = await db.query(`
      WITH RECURSIVE material_chain AS (
        -- Finished goods
        SELECT 
          'FINISHED_GOODS' as entity_type,
          fgb.id,
          fgb.fg_batch_number as entity_number,
          p.name as entity_name,
          fgb.quantity_produced as quantity,
          fgb.state,
          fgb.production_date as date,
          NULL::uuid as parent_id
        FROM finished_goods_batches fgb
        JOIN products p ON fgb.product_id = p.id
        WHERE fgb.id = $1
        
        UNION ALL
        
        -- Production components (materials used)
        SELECT 
          'RAW_MATERIAL' as entity_type,
          rmb.id,
          rmb.batch_number,
          rm.name,
          bca.allocated_quantity,
          rmb.status,
          rmb.received_date,
          bc.id
        FROM finished_goods_batches fgb
        JOIN production_execution pe ON fgb.production_execution_id = pe.id
        JOIN batch_cards bc ON pe.batch_card_id = bc.id
        JOIN batch_card_allocations bca ON bc.id = bca.batch_card_id
        JOIN inventory_lots il ON bca.inventory_lot_id = il.id
        JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
        JOIN raw_materials rm ON rmb.material_id = rm.id
        WHERE fgb.id = $1
      )
      SELECT * FROM material_chain
    `, [fgBatchId]);

    return traceability;
  }

  /**
   * Reverse Traceability Report
   * Which products contain a specific material batch
   */
  async getReverseTraceability(materialBatchId: string) {
    return await db.query(`
      SELECT DISTINCT
        fgb.fg_batch_number,
        fgb.state as fg_status,
        p.name as product_name,
        fgb.quantity_produced,
        fgb.production_date,
        dn.dn_number,
        so.so_number,
        c.name as customer_name,
        siv.siv_number
      FROM raw_material_batches rmb
      JOIN inventory_lots il ON rmb.id = il.material_batch_id
      JOIN batch_card_allocations bca ON il.id = bca.inventory_lot_id
      JOIN batch_cards bc ON bca.batch_card_id = bc.id
      JOIN production_execution pe ON bc.id = pe.batch_card_id
      JOIN finished_goods_batches fgb ON pe.id = fgb.production_execution_id
      JOIN products p ON fgb.product_id = p.id
      JOIN sales_orders so ON bc.so_id = so.id
      JOIN customers c ON so.customer_id = c.id
      LEFT JOIN delivery_note_items dni ON fgb.id = dni.fg_batch_id
      LEFT JOIN delivery_notes dn ON dni.dn_id = dn.id
      LEFT JOIN store_issue_vouchers siv ON dn.id = siv.dn_id
      WHERE rmb.id = $1
      ORDER BY fgb.production_date DESC
    `, [materialBatchId]);
  }

  /**
   * Material Journey Report
   * Complete journey of a raw material batch
   */
  async getMaterialJourney(materialBatchId: string) {
    return await db.query(`
      SELECT 
        rmb.batch_number,
        rm.name as material_name,
        s.name as supplier_name,
        rmb.manufacturing_date,
        rmb.expiry_date,
        EXTRACT(DAY FROM (rmb.expiry_date - rmb.manufacturing_date)) as shelf_life_days,
        rmb.quantity_received,
        rmb.status,
        qtr.test_number,
        qtr.result as qc_result,
        qtr.tested_by,
        qtr.approval_date,
        STRING_AGG(DISTINCT bc.batch_card_number, ', ') as used_in_batches,
        STRING_AGG(DISTINCT fgb.fg_batch_number, ', ') as resulted_in_fg,
        SUM(il.quantity_consumed) as total_consumed
      FROM raw_material_batches rmb
      JOIN raw_materials rm ON rmb.material_id = rm.id
      JOIN suppliers s ON rmb.supplier_id = s.id
      LEFT JOIN qc_test_results qtr ON rmb.id = qtr.material_batch_id
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
      LEFT JOIN batch_card_allocations bca ON il.id = bca.inventory_lot_id
      LEFT JOIN batch_cards bc ON bca.batch_card_id = bc.id
      LEFT JOIN production_execution pe ON bc.id = pe.batch_card_id
      LEFT JOIN finished_goods_batches fgb ON pe.id = fgb.production_execution_id
      WHERE rmb.id = $1
      GROUP BY rmb.id, rm.id, s.id, qtr.id
    `, [materialBatchId]);
  }

  /**
   * Certificate of Analysis Report
   */
  async generateCOAReport(fgBatchId: string) {
    const fgBatch = await db.query(`
      SELECT 
        fgb.fg_batch_number,
        fgb.production_date,
        fgb.quantity_produced,
        p.name as product_name,
        p.code as product_code,
        c.name as customer_name,
        c.address,
        c.city,
        c.country,
        so.so_number,
        coa.coa_number,
        coa.test_results,
        coa.certified_by,
        coa.certification_date
      FROM finished_goods_batches fgb
      JOIN products p ON fgb.product_id = p.id
      JOIN production_execution pe ON fgb.production_execution_id = pe.id
      JOIN batch_cards bc ON pe.batch_card_id = bc.id
      JOIN sales_orders so ON bc.so_id = so.id
      JOIN customers c ON so.customer_id = c.id
      LEFT JOIN certificates_of_analysis coa ON fgb.id = coa.fg_batch_id
      WHERE fgb.id = $1
    `, [fgBatchId]);

    if (fgBatch.length === 0) {
      throw new Error('Finished goods batch not found');
    }

    return fgBatch[0];
  }

  /**
   * Production Summary Report
   */
  async getProductionSummary(startDate: Date, endDate: Date) {
    return await db.query(`
      SELECT 
        DATE(bc.production_start) as production_date,
        p.name as product_name,
        COUNT(*) as batches_produced,
        SUM(bc.actual_quantity) as total_produced,
        SUM(bc.scrap_quantity) as total_scrap,
        ROUND(AVG(bc.yield_percent)::numeric, 2) as avg_yield_percent,
        MIN(bc.yield_percent) as min_yield,
        MAX(bc.yield_percent) as max_yield,
        COUNT(CASE WHEN bc.yield_percent < 95 THEN 1 END) as low_yield_count
      FROM batch_cards bc
      JOIN products p ON bc.product_id = p.id
      WHERE bc.production_start BETWEEN $1 AND $2
      GROUP BY DATE(bc.production_start), p.id
      ORDER BY production_date DESC, product_name
    `, [startDate, endDate]);
  }

  /**
   * Quality Performance Report
   */
  async getQualityPerformance(startDate: Date, endDate: Date) {
    return await db.query(`
      SELECT 
        DATE(qtr.created_at) as test_date,
        qtr.test_type,
        COUNT(*) as total_tests,
        COUNT(CASE WHEN qtr.result = 'PASSED' THEN 1 END) as passed_tests,
        COUNT(CASE WHEN qtr.result = 'FAILED' THEN 1 END) as failed_tests,
        ROUND(
          (COUNT(CASE WHEN qtr.result = 'PASSED' THEN 1 END)::float / COUNT(*)::float * 100)::numeric,
          2
        ) as pass_rate_percent
      FROM qc_test_results qtr
      WHERE qtr.created_at BETWEEN $1 AND $2
      GROUP BY DATE(qtr.created_at), qtr.test_type
      ORDER BY test_date DESC, test_type
    `, [startDate, endDate]);
  }

  /**
   * Sales Performance Report
   */
  async getSalesPerformance(startDate: Date, endDate: Date) {
    return await db.query(`
      SELECT 
        c.name as customer_name,
        COUNT(DISTINCT so.id) as orders,
        COUNT(DISTINCT fgb.id) as delivered_batches,
        SUM(fgb.quantity_produced) as total_quantity,
        SUM(so.total_amount) as total_sales,
        ROUND(AVG(fgb.quantity_produced)::numeric, 2) as avg_batch_size
      FROM sales_orders so
      JOIN customers c ON so.customer_id = c.id
      LEFT JOIN batch_cards bc ON so.id = bc.so_id
      LEFT JOIN production_execution pe ON bc.id = pe.batch_card_id
      LEFT JOIN finished_goods_batches fgb ON pe.id = fgb.production_execution_id
      WHERE so.created_at BETWEEN $1 AND $2
      GROUP BY c.id
      ORDER BY total_sales DESC
    `, [startDate, endDate]);
  }

  /**
   * Procurement Report
   */
  async getProcurementReport(startDate: Date, endDate: Date) {
    return await db.query(`
      SELECT 
        s.name as supplier_name,
        COUNT(DISTINCT po.id) as purchase_orders,
        COUNT(DISTINCT rmb.id) as received_batches,
        SUM(poi.line_total) as total_spent,
        COUNT(CASE WHEN qtr.result = 'FAILED' THEN 1 END) as rejected_batches,
        ROUND(
          (COUNT(CASE WHEN qtr.result = 'PASSED' THEN 1 END)::float / COUNT(qtr.id)::float * 100)::numeric,
          2
        ) as acceptance_rate_percent
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
      LEFT JOIN goods_receipt_notes grn ON po.id = grn.po_id
      LEFT JOIN raw_material_batches rmb ON grn.id = rmb.po_id
      LEFT JOIN qc_test_results qtr ON rmb.id = qtr.material_batch_id
      WHERE po.created_at BETWEEN $1 AND $2
      GROUP BY s.id
      ORDER BY total_spent DESC
    `, [startDate, endDate]);
  }

  /**
   * Inventory Aging Report
   */
  async getInventoryAgingReport() {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        il.lot_number,
        rmb.batch_number,
        rmb.received_date,
        EXTRACT(DAY FROM (NOW() - rmb.received_date))::int as days_in_inventory,
        il.quantity_on_hand,
        il.state,
        rmb.expiry_date,
        EXTRACT(DAY FROM (rmb.expiry_date - NOW()))::int as days_until_expiry
      FROM inventory_lots il
      JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      JOIN raw_materials rm ON rmb.material_id = rm.id
      WHERE il.state IN ('APPROVED', 'ALLOCATED', 'QUARANTINE')
      ORDER BY rmb.received_date ASC
    `);
  }

  /**
   * Supplier Quality Report
   */
  async getSupplierQualityReport(startDate: Date, endDate: Date) {
    return await db.query(`
      SELECT 
        s.name as supplier_name,
        COUNT(DISTINCT rmb.id) as total_batches_received,
        COUNT(DISTINCT CASE WHEN qtr.result = 'PASSED' THEN rmb.id END) as accepted_batches,
        COUNT(DISTINCT CASE WHEN qtr.result = 'FAILED' THEN rmb.id END) as rejected_batches,
        ROUND(
          (COUNT(DISTINCT CASE WHEN qtr.result = 'PASSED' THEN rmb.id END)::float / 
           COUNT(DISTINCT rmb.id)::float * 100)::numeric,
          2
        ) as acceptance_rate_percent
      FROM suppliers s
      LEFT JOIN raw_material_batches rmb ON s.id = rmb.supplier_id
      LEFT JOIN qc_test_results qtr ON rmb.id = qtr.material_batch_id
      WHERE rmb.received_date BETWEEN $1 AND $2
      GROUP BY s.id
      ORDER BY acceptance_rate_percent ASC
    `, [startDate, endDate]);
  }

  /**
   * Batch Card Summary Report
   */
  async getBatchCardSummaryReport(soId: string) {
    return await db.query(`
      SELECT 
        bc.batch_card_number,
        bc.status,
        bc.planned_quantity,
        bc.actual_quantity,
        bc.scrap_quantity,
        bc.yield_percent,
        EXTRACT(HOUR FROM (bc.production_end - bc.production_start)) as production_hours,
        STRING_AGG(DISTINCT rm.name, ', ') as materials_used,
        STRING_AGG(DISTINCT rmb.batch_number, ', ') as supplier_batches,
        COUNT(DISTINCT il.id) as material_lots_used
      FROM batch_cards bc
      LEFT JOIN batch_card_formulas bcf ON bc.id = bcf.batch_card_id
      LEFT JOIN raw_materials rm ON bcf.material_id = rm.id
      LEFT JOIN raw_material_batches rmb ON bcf.material_batch_id = rmb.id
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
      WHERE bc.so_id = $1
      GROUP BY bc.id
    `, [soId]);
  }
}

export const reportsService = new ReportsService();
