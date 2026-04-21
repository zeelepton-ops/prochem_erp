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

  async getBatchTraceability(batchId: string) {
    return await db.query(`
      SELECT 
        bt.*,
        rmb.material_name,
        rmb.batch_number as material_batch_number,
        fgb.batch_number as fg_batch_number,
        p.name as product_name
      FROM batch_traceability bt
      LEFT JOIN raw_material_batches rmb ON bt.material_batch_id = rmb.id
      LEFT JOIN finished_goods_batches fgb ON bt.fg_batch_id = fgb.id
      LEFT JOIN products p ON fgb.product_id = p.id
      WHERE bt.fg_batch_id = $1 OR bt.material_batch_id = $1
      ORDER BY bt.created_at DESC
    `, [batchId]);
  }

  async getProductionEfficiencyReport(filters?: { startDate?: string; endDate?: string }) {
    let query = `
      SELECT 
        pe.*,
        bc.batch_card_number,
        p.name as product_name,
        fgb.batch_number as fg_batch_number,
        fgb.quantity_produced,
        fgb.state as fg_state
      FROM production_execution pe
      LEFT JOIN batch_cards bc ON pe.batch_card_id = bc.id
      LEFT JOIN products p ON bc.product_id = p.id
      LEFT JOIN finished_goods_batches fgb ON pe.id = fgb.production_execution_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      query += ` AND pe.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND pe.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' ORDER BY pe.created_at DESC';

    return await db.query(query, params);
  }

  async getInventoryReport() {
    return await db.query(`
      SELECT 
        il.*,
        rmb.material_name,
        rmb.batch_number,
        rm.unit_of_measure,
        w.name as warehouse_name,
        l.name as location_name
      FROM inventory_lots il
      LEFT JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      LEFT JOIN raw_materials rm ON rmb.material_id = rm.id
      LEFT JOIN warehouses w ON il.warehouse_id = w.id
      LEFT JOIN locations l ON il.location_id = l.id
      ORDER BY il.created_at DESC
    `);
  }

  async getSalesReport(filters?: { startDate?: string; endDate?: string }) {
    let query = `
      SELECT 
        so.*,
        c.name as customer_name,
        c.customer_code,
        p.name as product_name,
        sod.quantity_ordered,
        sod.unit_price,
        sod.total_amount
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN sales_order_details sod ON so.id = sod.so_id
      LEFT JOIN products p ON sod.product_id = p.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      query += ` AND so.order_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND so.order_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' ORDER BY so.order_date DESC';

    return await db.query(query, params);
  }

  async getPurchaseReport(filters?: { startDate?: string; endDate?: string }) {
    let query = `
      SELECT 
        po.*,
        s.name as supplier_name,
        s.supplier_code,
        rm.name as material_name,
        pod.quantity_ordered,
        pod.unit_price,
        pod.total_amount
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_order_details pod ON po.id = pod.po_id
      LEFT JOIN raw_materials rm ON pod.material_id = rm.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      query += ` AND po.order_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND po.order_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' ORDER BY po.order_date DESC';

    return await db.query(query, params);
  }

  async getInventoryTurnoverReport() {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        COUNT(DISTINCT rmb.id) as batch_count,
        SUM(il.quantity_on_hand) as current_stock,
        AVG(EXTRACT(DAY FROM NOW() - rmb.received_date)) as avg_days_in_stock,
        SUM(CASE WHEN rmb.expiry_date <= NOW() + INTERVAL '30 days' THEN il.quantity_on_hand ELSE 0 END) as expiring_soon
      FROM raw_materials rm
      LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
      WHERE il.state = 'APPROVED'
      GROUP BY rm.id, rm.name
      ORDER BY avg_days_in_stock DESC
    `);
  }

  async getBatchConsumptionReport() {
    return await db.query(`
      SELECT 
        bc.batch_card_number,
        p.name as product_name,
        bc.planned_quantity,
        bc.actual_quantity_produced,
        bc.scrap_quantity,
        ROUND(((bc.actual_quantity_produced / NULLIF(bc.planned_quantity, 0)) * 100)::numeric, 2) as yield_percent,
        COUNT(DISTINCT plog.id) as production_log_count,
        SUM(plog.quantity_consumed) as total_consumed
      FROM batch_cards bc
      LEFT JOIN products p ON bc.product_id = p.id
      LEFT JOIN production_logs plog ON bc.id = plog.batch_card_id
      GROUP BY bc.id, p.id
      ORDER BY bc.created_at DESC
    `);
  }

  async getMaterialGenealogyReport(materialId: string) {
    return await db.query(`
      WITH RECURSIVE genealogy AS (
        SELECT 
          rmb.id,
          rmb.batch_number,
          rmb.material_id,
          rm.name as material_name,
          rmb.supplier_id,
          s.name as supplier_name,
          rmb.received_date,
          1 as level
        FROM raw_material_batches rmb
        LEFT JOIN raw_materials rm ON rmb.material_id = rm.id
        LEFT JOIN suppliers s ON rmb.supplier_id = s.id
        WHERE rmb.material_id = $1
        
        UNION ALL
        
        SELECT 
          fgb.id,
          fgb.batch_number,
          NULL,
          p.name,
          NULL,
          NULL,
          fgb.production_date,
          g.level + 1
        FROM genealogy g
        JOIN batch_cards bc ON g.id::text = bc.id::text
        JOIN finished_goods_batches fgb ON bc.id = fgb.batch_card_id
        LEFT JOIN products p ON fgb.product_id = p.id
        WHERE g.level < 5
      )
      SELECT * FROM genealogy
      ORDER BY level, received_at DESC
    `, [materialId]);
  }

  async getComplianceReport(filters?: { startDate?: string; endDate?: string }) {
    let query = `
      SELECT 
        COUNT(DISTINCT qtr.id) as total_tests,
        SUM(CASE WHEN qtr.status = 'PASSED' THEN 1 ELSE 0 END) as passed_tests,
        SUM(CASE WHEN qtr.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_tests,
        ROUND((SUM(CASE WHEN qtr.status = 'PASSED' THEN 1 ELSE 0 END)::numeric / COUNT(DISTINCT qtr.id)) * 100, 2) as pass_rate,
        qtr.test_type,
        COUNT(DISTINCT rmb.supplier_id) as supplier_count
      FROM qc_test_results qtr
      LEFT JOIN raw_material_batches rmb ON qtr.material_batch_id = rmb.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      query += ` AND qtr.created_at >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND qtr.created_at <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' GROUP BY qtr.test_type';

    return await db.query(query, params);
  }

  async getExpiryRiskReport() {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        rmb.batch_number,
        rmb.expiry_date,
        EXTRACT(DAY FROM rmb.expiry_date - NOW()) as days_until_expiry,
        SUM(il.quantity_on_hand) as quantity_at_risk,
        CASE 
          WHEN rmb.expiry_date <= NOW() THEN 'EXPIRED'
          WHEN rmb.expiry_date <= NOW() + INTERVAL '7 days' THEN 'CRITICAL'
          WHEN rmb.expiry_date <= NOW() + INTERVAL '30 days' THEN 'HIGH'
          WHEN rmb.expiry_date <= NOW() + INTERVAL '60 days' THEN 'MEDIUM'
          ELSE 'LOW'
        END as risk_level
      FROM raw_material_batches rmb
      LEFT JOIN raw_materials rm ON rmb.material_id = rm.id
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
      WHERE rmb.status IN ('APPROVED', 'ALLOCATED')
      GROUP BY rmb.id, rm.id
      ORDER BY rmb.expiry_date ASC
    `);
  }

  async getAuditTrail(entityId: string, entityType?: string) {
    let query = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_id = $1
    `;
    
    const params: any[] = [entityId];

    if (entityType) {
      query += ` AND al.entity_type = $2`;
      params.push(entityType);
    }

    query += ' ORDER BY al.created_at DESC';

    return await db.query(query, params);
  }

  async getDashboardMetrics() {
    return await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM purchase_orders WHERE status IN ('submitted', 'confirmed')) as pending_pos,
        (SELECT COUNT(*) FROM sales_orders WHERE status IN ('submitted', 'confirmed')) as pending_sos,
        (SELECT COUNT(*) FROM raw_material_batches WHERE status = 'QUARANTINE') as quarantined_materials,
        (SELECT SUM(quantity_on_hand) FROM inventory_lots WHERE state = 'APPROVED') as total_inventory,
        (SELECT COUNT(*) FROM qc_test_results WHERE status = 'PENDING') as pending_qc_tests,
        (SELECT COUNT(*) FROM batch_cards WHERE status = 'IN_PROGRESS') as active_productions,
        (SELECT SUM(quantity_on_hand) FROM inventory_lots WHERE expiry_date <= NOW() + INTERVAL '30 days') as expiring_soon,
        (SELECT COUNT(DISTINCT supplier_id) FROM purchase_orders WHERE status != 'cancelled') as active_suppliers
    `);
  }
}

export const reportsService = new ReportsService();
