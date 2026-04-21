// ============================================================================
// PRODUCTION SERVICE
// Production batch tracking, yield analysis, and material consumption
// ============================================================================

import { db } from '../config/database';

export class ProductionService {
  /**
   * Release Batch Card for Production
   * PENDING -> RELEASED (all materials must be allocated)
   */
  async releaseBatchCard(data: {
    batchCardId: string;
    releasedBy: string;
  }) {
    // Check batch card status
    const bc = await db.query(
      `SELECT * FROM batch_cards WHERE id = $1`,
      [data.batchCardId]
    );

    if (bc.length === 0) {
      throw new Error('Batch Card not found');
    }

    if (bc[0].status !== 'PENDING') {
      throw new Error('Batch Card must be in PENDING status to release');
    }

    // Verify all materials are allocated
    const unallocated = await db.query(
      `SELECT bcf.* FROM batch_card_formulas bcf
       LEFT JOIN batch_card_allocations bca ON bcf.batch_card_id = bca.batch_card_id
       WHERE bcf.batch_card_id = $1
       GROUP BY bcf.id
       HAVING COUNT(bca.id) = 0`,
      [data.batchCardId]
    );

    if (unallocated.length > 0) {
      throw new Error('Not all materials are allocated. Cannot release batch card.');
    }

    // Update batch card status
    const released = await db.query(
      `UPDATE batch_cards 
       SET status = $1, released_date = NOW(), released_by = $2
       WHERE id = $3
       RETURNING *`,
      ['RELEASED', data.releasedBy, data.batchCardId]
    );

    // Create Production Execution record
    const pe = await db.query(
      `INSERT INTO production_execution (batch_card_id, status, started_by, start_date)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.batchCardId, 'INITIATED', data.releasedBy]
    );

    return { batchCard: released[0], productionExecution: pe[0] };
  }

  /**
   * Log Production Start
   * RELEASED -> IN_PRODUCTION
   */
  async startProduction(data: {
    batchCardId: string;
    operatorId: string;
    shiftNumber: string;
  }) {
    const bc = await db.query(`SELECT * FROM batch_cards WHERE id = $1`, [data.batchCardId]);

    if (bc[0].status !== 'RELEASED') {
      throw new Error('Batch Card must be RELEASED to start production');
    }

    const updated = await db.query(
      `UPDATE batch_cards 
       SET status = $1, production_start = NOW()
       WHERE id = $2
       RETURNING *`,
      ['IN_PRODUCTION', data.batchCardId]
    );

    // Update production execution
    await db.query(
      `UPDATE production_execution 
       SET status = $1, operator_id = $2, shift_number = $3, actual_start = NOW()
       WHERE batch_card_id = $4`,
      ['IN_PROGRESS', data.operatorId, data.shiftNumber, data.batchCardId]
    );

    return updated[0];
  }

  /**
   * Log Material Consumption During Production
   */
  async logMaterialConsumption(data: {
    batchCardId: string;
    inventoryLotId: string;
    quantityConsumed: number;
    timestamp: Date;
    loggedBy: string;
  }) {
    // Verify allocation exists and is sufficient
    const allocation = await db.query(
      `SELECT * FROM batch_card_allocations 
       WHERE batch_card_id = $1 AND inventory_lot_id = $2`,
      [data.batchCardId, data.inventoryLotId]
    );

    if (allocation.length === 0) {
      throw new Error('No allocation found for this material in this batch card');
    }

    if (allocation[0].allocated_quantity < data.quantityConsumed) {
      throw new Error('Consumption exceeds allocated quantity');
    }

    // Record consumption
    const log = await db.query(
      `INSERT INTO production_logs 
       (batch_card_id, inventory_lot_id, quantity_consumed, logged_by, logged_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.batchCardId, data.inventoryLotId, data.quantityConsumed, data.loggedBy, data.timestamp]
    );

    // Update inventory lot
    const lot = await db.query(
      `SELECT * FROM inventory_lots WHERE id = $1`,
      [data.inventoryLotId]
    );

    const newQty = lot[0].quantity_on_hand - data.quantityConsumed;
    const newState = newQty <= 0 ? 'CONSUMED' : 'ALLOCATED';

    await db.query(
      `UPDATE inventory_lots 
       SET quantity_on_hand = $1, 
           quantity_consumed = quantity_consumed + $2,
           state = $3
       WHERE id = $4`,
      [Math.max(0, newQty), data.quantityConsumed, newState, data.inventoryLotId]
    );

    // Update allocation consumed quantity
    await db.query(
      `UPDATE batch_card_allocations 
       SET consumed_quantity = consumed_quantity + $1
       WHERE batch_card_id = $2 AND inventory_lot_id = $3`,
      [data.quantityConsumed, data.batchCardId, data.inventoryLotId]
    );

    return log[0];
  }

  /**
   * Complete Production & Log Finished Goods
   * IN_PRODUCTION -> PRODUCTION_COMPLETE
   */
  async completeProduction(data: {
    batchCardId: string;
    quantityProduced: number;
    scrapQuantity: number;
    comments?: string;
    completedBy: string;
  }) {
    const bc = await db.query(`SELECT * FROM batch_cards WHERE id = $1`, [data.batchCardId]);

    if (bc[0].status !== 'IN_PRODUCTION') {
      throw new Error('Batch Card must be IN_PRODUCTION to complete');
    }

    // Calculate yield
    const theoreticalYield = bc[0].theoretical_yield;
    const actualYield = data.quantityProduced;
    const yieldPercent = (actualYield / theoreticalYield) * 100;

    // Update batch card
    const updated = await db.query(
      `UPDATE batch_cards 
       SET status = $1, actual_quantity = $2, scrap_quantity = $3, yield_percent = $4, production_end = NOW()
       WHERE id = $5
       RETURNING *`,
      ['PRODUCTION_COMPLETE', data.quantityProduced, data.scrapQuantity, yieldPercent, data.batchCardId]
    );

    // Update production execution
    const pe = await db.query(
      `UPDATE production_execution 
       SET status = $1, actual_end = NOW(), completed_by = $2
       WHERE batch_card_id = $3
       RETURNING *`,
      ['COMPLETED', data.completedBy, data.batchCardId]
    );

    // Create Finished Goods Batch
    const fgBatchNumber = `FG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const fgBatch = await db.query(
      `INSERT INTO finished_goods_batches 
       (fg_batch_number, production_execution_id, product_id, quantity_produced, scrap_quantity, production_date, state, qc_status)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
       RETURNING *`,
      [
        fgBatchNumber,
        pe[0].id,
        bc[0].product_id,
        data.quantityProduced,
        data.scrapQuantity,
        'QUARANTINE', // FG enters QC
        'PENDING',
      ]
    );

    return { batchCard: updated[0], finishedGoods: fgBatch[0] };
  }

  /**
   * Get Production Dashboard Data
   */
  async getProductionDashboard() {
    const stats = await db.query(`
      SELECT
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as pending_batches,
        COUNT(CASE WHEN status = 'RELEASED' THEN 1 END)::int as released_batches,
        COUNT(CASE WHEN status = 'IN_PRODUCTION' THEN 1 END)::int as active_batches,
        COUNT(CASE WHEN status = 'PRODUCTION_COMPLETE' THEN 1 END)::int as completed_batches,
        AVG(CASE WHEN yield_percent IS NOT NULL THEN yield_percent ELSE NULL END)::float as avg_yield_percent,
        COUNT(CASE WHEN yield_percent < 95 THEN 1 END)::int as low_yield_count
      FROM batch_cards
    `);

    return stats[0];
  }

  /**
   * Get Production History
   */
  async getProductionHistory(limit: number = 50) {
    return await db.query(`
      SELECT 
        bc.batch_card_number,
        p.name as product_name,
        bc.planned_quantity,
        bc.actual_quantity,
        bc.scrap_quantity,
        bc.yield_percent,
        bc.status,
        bc.production_start,
        bc.production_end,
        pe.operator_id,
        u.name as operator_name,
        EXTRACT(EPOCH FROM (bc.production_end - bc.production_start))/3600 as production_hours
      FROM batch_cards bc
      JOIN products p ON bc.product_id = p.id
      LEFT JOIN production_execution pe ON bc.id = pe.batch_card_id
      LEFT JOIN users u ON pe.operator_id = u.id
      WHERE bc.status IN ('PRODUCTION_COMPLETE', 'IN_PRODUCTION', 'RELEASED')
      ORDER BY bc.production_start DESC
      LIMIT $1
    `, [limit]);
  }

  /**
   * Get Consumption Report for Batch Card
   */
  async getConsumptionReport(batchCardId: string) {
    return await db.query(`
      SELECT
        bc.batch_card_number,
        rm.name as material_name,
        bcf.quantity as planned_quantity,
        SUM(pl.quantity_consumed) as consumed_quantity,
        bcf.quantity - COALESCE(SUM(pl.quantity_consumed), 0) as variance,
        bcf.scrap_percent,
        il.lot_number,
        rmb.batch_number as supplier_batch_number
      FROM batch_cards bc
      JOIN batch_card_formulas bcf ON bc.id = bcf.batch_card_id
      JOIN raw_materials rm ON bcf.material_id = rm.id
      LEFT JOIN production_logs pl ON bc.id = pl.batch_card_id AND bcf.material_id = (
        SELECT material_id FROM inventory_lots WHERE id = pl.inventory_lot_id
      )
      LEFT JOIN inventory_lots il ON pl.inventory_lot_id = il.id
      LEFT JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      WHERE bc.id = $1
      GROUP BY bc.id, bcf.id, rm.id, il.id, rmb.id
    `, [batchCardId]);
  }

  /**
   * Yield Analysis Report
   */
  async getYieldAnalysis(filters?: { startDate?: Date; endDate?: Date }) {
    let query = `
      SELECT 
        DATE(bc.production_start) as production_date,
        COUNT(*) as batches_produced,
        AVG(bc.yield_percent) as avg_yield,
        MIN(bc.yield_percent) as min_yield,
        MAX(bc.yield_percent) as max_yield,
        SUM(CASE WHEN bc.yield_percent < 95 THEN 1 ELSE 0 END) as below_target_count,
        SUM(bc.actual_quantity_produced) as total_quantity_produced,
        SUM(bc.scrap_quantity) as total_scrap
      FROM batch_cards bc
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.startDate) {
      query += ` AND bc.production_start >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND bc.production_start <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' GROUP BY DATE(bc.production_start) ORDER BY production_date DESC';

    return await db.query(query, params);
  }

  /**
   * Quality Issues (Low Yield Batches)
   */
  async getLowYieldBatches(threshold: number = 95) {
    return await db.query(`
      SELECT 
        bc.batch_card_number,
        p.name as product_name,
        bc.yield_percent,
        bc.planned_quantity,
        bc.actual_quantity,
        bc.scrap_quantity,
        bc.production_start,
        bc.status,
        u.name as operator_name
      FROM batch_cards bc
      JOIN products p ON bc.product_id = p.id
      LEFT JOIN production_execution pe ON bc.id = pe.batch_card_id
      LEFT JOIN users u ON pe.operator_id = u.id
      WHERE bc.yield_percent < $1
      ORDER BY bc.yield_percent ASC
    `, [threshold]);
  }

  async createBatchCard(data: { productId: string; quantity: number; soId?: string; createdBy: string }) {
    const result = await db.query(`
      INSERT INTO batch_cards (product_id, planned_quantity, so_id, created_by, status)
      VALUES ($1, $2, $3, $4, 'DRAFT')
      RETURNING *
    `, [data.productId, data.quantity, data.soId, data.createdBy]);
    return result.rows[0];
  }

  async getBatchCard(id: string) {
    return await db.query(`
      SELECT 
        bc.*,
        p.name as product_name,
        p.sku,
        so.order_number as sales_order_number,
        u.name as created_by_name
      FROM batch_cards bc
      LEFT JOIN products p ON bc.product_id = p.id
      LEFT JOIN sales_orders so ON bc.so_id = so.id
      LEFT JOIN users u ON bc.created_by = u.id
      WHERE bc.id = $1
    `, [id]);
  }

  async listBatchCards(filters?: { productId?: string; status?: string; soId?: string; salesOrderId?: string }) {
    let query = `
      SELECT 
        bc.*,
        p.name as product_name,
        p.sku,
        so.order_number as sales_order_number,
        COUNT(DISTINCT bcf.material_id) as material_count
      FROM batch_cards bc
      LEFT JOIN products p ON bc.product_id = p.id
      LEFT JOIN sales_orders so ON bc.so_id = so.id
      LEFT JOIN batch_card_formulas bcf ON bc.id = bcf.batch_card_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.productId) {
      query += ` AND bc.product_id = $${paramIndex}`;
      params.push(filters.productId);
      paramIndex++;
    }

    if (filters?.status) {
      query += ` AND bc.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' GROUP BY bc.id, p.id, so.id ORDER BY bc.created_at DESC';

    return await db.query(query, params);
  }

  async getProductionLogs(batchCardId: string) {
    return await db.query(`
      SELECT 
        plog.*,
        il.lot_number,
        rmb.batch_number,
        rm.name as material_name,
        u.name as logged_by_name
      FROM production_logs plog
      LEFT JOIN inventory_lots il ON plog.inventory_lot_id = il.id
      LEFT JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      LEFT JOIN raw_materials rm ON rmb.material_id = rm.id
      LEFT JOIN users u ON plog.logged_by = u.id
      WHERE plog.batch_card_id = $1
      ORDER BY plog.created_at DESC
    `, [batchCardId]);
  }
}

export const productionService = new ProductionService();
