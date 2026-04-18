// ============================================================================
// INVENTORY SERVICE
// FEFO (First Expired First Out) allocation and inventory management
// ============================================================================

import { db } from '../config/database';

export class InventoryService {
  /**
   * Get Available Inventory by Material
   * Returns approved lots sorted by FEFO (expiry date)
   */
  async getAvailableInventory(materialId: string) {
    return await db.query(`
      SELECT 
        il.id,
        il.lot_number,
        rmb.batch_number as supplier_batch,
        rmb.expiry_date,
        il.quantity_on_hand,
        il.quantity_reserved,
        il.quantity_consumed,
        (il.quantity_on_hand - il.quantity_reserved) as available_quantity,
        EXTRACT(DAY FROM (rmb.expiry_date - NOW())) as days_until_expiry,
        il.state,
        s.name as supplier_name
      FROM inventory_lots il
      JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      JOIN suppliers s ON rmb.supplier_id = s.id
      WHERE rmb.material_id = $1 
        AND il.state = 'APPROVED'
        AND rmb.expiry_date > NOW()
      ORDER BY rmb.expiry_date ASC
    `, [materialId]);
  }

  /**
   * FEFO Allocation Strategy
   * Allocates inventory to batch card following FEFO rules
   */
  async allocateWithFEFO(data: {
    batchCardId: string;
    materialId: string;
    requiredQuantity: number;
    allocatedBy: string;
  }) {
    // Get available inventory sorted by expiry (FEFO)
    const availableLots = await this.getAvailableInventory(data.materialId);

    if (availableLots.length === 0) {
      throw new Error(
        `No approved inventory available for material ${data.materialId}. Cannot allocate with FEFO.`
      );
    }

    // Calculate total available
    const totalAvailable = availableLots.reduce((sum, lot) => sum + lot.available_quantity, 0);

    if (totalAvailable < data.requiredQuantity) {
      throw new Error(
        `Insufficient inventory. Required: ${data.requiredQuantity}, Available: ${totalAvailable}`
      );
    }

    // Allocate from earliest expiry lots first
    const allocations = [];
    let remainingToAllocate = data.requiredQuantity;
    let allocationOrder = 1;

    for (const lot of availableLots) {
      if (remainingToAllocate <= 0) break;

      const allocateQty = Math.min(lot.available_quantity, remainingToAllocate);

      const allocation = await db.query(
        `INSERT INTO batch_card_allocations 
         (batch_card_id, inventory_lot_id, allocated_quantity, status, allocation_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.batchCardId, lot.id, allocateQty, 'ALLOCATED', allocationOrder]
      );

      // Update inventory lot reservation
      await db.query(
        `UPDATE inventory_lots 
         SET quantity_reserved = quantity_reserved + $1, state = $2
         WHERE id = $3`,
        [allocateQty, 'ALLOCATED', lot.id]
      );

      allocations.push({
        allocation: allocation[0],
        lot: lot,
        allocatedQty: allocateQty,
        expiryDate: lot.expiry_date,
        daysUntilExpiry: lot.days_until_expiry,
      });

      remainingToAllocate -= allocateQty;
      allocationOrder++;
    }

    return {
      batchCardId: data.batchCardId,
      materialId: data.materialId,
      allocations,
      totalAllocated: data.requiredQuantity,
    };
  }

  /**
   * Get Inventory Summary
   */
  async getInventorySummary() {
    return await db.query(`
      SELECT 
        rm.id,
        rm.name as material_name,
        COUNT(DISTINCT il.id) as total_lots,
        SUM(CASE WHEN il.state = 'APPROVED' THEN 1 ELSE 0 END)::int as approved_lots,
        SUM(CASE WHEN il.state = 'QUARANTINE' THEN 1 ELSE 0 END)::int as quarantine_lots,
        SUM(CASE WHEN il.state = 'ALLOCATED' THEN 1 ELSE 0 END)::int as allocated_lots,
        SUM(il.quantity_on_hand) as total_quantity,
        SUM(CASE WHEN il.state = 'APPROVED' THEN il.quantity_on_hand - il.quantity_reserved ELSE 0 END) as available_quantity,
        SUM(il.quantity_reserved) as reserved_quantity,
        MIN(rmb.expiry_date) as earliest_expiry,
        EXTRACT(DAY FROM (MIN(rmb.expiry_date) - NOW())) as days_until_earliest_expiry
      FROM raw_materials rm
      LEFT JOIN raw_material_batches rmb ON rm.id = rmb.material_id
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
      GROUP BY rm.id
      ORDER BY rm.name
    `);
  }

  /**
   * Expiry Alert Report
   * Identify inventory expiring soon
   */
  async getExpiryAlerts(daysThreshold: number = 30) {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        il.lot_number,
        rmb.batch_number,
        rmb.expiry_date,
        EXTRACT(DAY FROM (rmb.expiry_date - NOW())) as days_until_expiry,
        il.quantity_on_hand,
        il.quantity_reserved,
        il.state,
        s.name as supplier_name
      FROM inventory_lots il
      JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      JOIN raw_materials rm ON rmb.material_id = rm.id
      JOIN suppliers s ON rmb.supplier_id = s.id
      WHERE rmb.expiry_date <= NOW() + INTERVAL '1 day' * $1
        AND rmb.expiry_date > NOW()
        AND il.state != 'CONSUMED'
      ORDER BY rmb.expiry_date ASC
    `, [daysThreshold]);
  }

  /**
   * Expired Inventory Report
   */
  async getExpiredInventory() {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        il.lot_number,
        rmb.batch_number,
        rmb.expiry_date,
        ABS(EXTRACT(DAY FROM (rmb.expiry_date - NOW())))::int as days_expired,
        il.quantity_on_hand,
        il.state,
        s.name as supplier_name
      FROM inventory_lots il
      JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      JOIN raw_materials rm ON rmb.material_id = rm.id
      JOIN suppliers s ON rmb.supplier_id = s.id
      WHERE rmb.expiry_date <= NOW()
        AND il.state IN ('APPROVED', 'ALLOCATED', 'QUARANTINE')
      ORDER BY rmb.expiry_date DESC
    `);
  }

  /**
   * Auto-expire Inventory
   * Run periodically to mark expired lots
   */
  async autoExpireInventory() {
    const result = await db.query(`
      UPDATE raw_material_batches 
      SET status = 'EXPIRED'
      WHERE expiry_date <= NOW()
        AND status NOT IN ('CONSUMED', 'SCRAP', 'REJECTED')
      RETURNING id
    `);

    // Update inventory lots to EXPIRED
    for (const batch of result) {
      await db.query(
        `UPDATE inventory_lots 
         SET state = 'EXPIRED'
         WHERE material_batch_id = $1 AND state != 'CONSUMED'`,
        [batch.id]
      );
    }

    return {
      message: `${result.length} batches auto-expired`,
      expiredBatches: result.length,
    };
  }

  /**
   * Get FEFO Analysis
   * Shows how much inventory is allocated from each lot
   */
  async getFEFOAnalysis(materialId: string) {
    return await db.query(`
      SELECT 
        il.lot_number,
        rmb.batch_number,
        rmb.expiry_date,
        EXTRACT(DAY FROM (rmb.expiry_date - NOW())) as days_until_expiry,
        il.quantity_on_hand,
        il.quantity_reserved,
        il.quantity_consumed,
        COUNT(bca.id) as allocated_to_batch_cards,
        SUM(bca.allocated_quantity) as total_allocated,
        SUM(bca.consumed_quantity) as total_consumed,
        il.state
      FROM inventory_lots il
      JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
      LEFT JOIN batch_card_allocations bca ON il.id = bca.inventory_lot_id
      WHERE rmb.material_id = $1
      GROUP BY il.id, rmb.id
      ORDER BY rmb.expiry_date ASC
    `, [materialId]);
  }

  /**
   * Get Allocation Status for Batch Card
   */
  async getAllocationStatus(batchCardId: string) {
    return await db.query(`
      SELECT 
        rm.name as material_name,
        bcf.quantity as planned_quantity,
        COALESCE(SUM(bca.allocated_quantity), 0) as allocated_quantity,
        bcf.quantity - COALESCE(SUM(bca.allocated_quantity), 0) as unallocated_quantity,
        CASE 
          WHEN COALESCE(SUM(bca.allocated_quantity), 0) >= bcf.quantity THEN 'FULLY_ALLOCATED'
          WHEN COALESCE(SUM(bca.allocated_quantity), 0) > 0 THEN 'PARTIALLY_ALLOCATED'
          ELSE 'NOT_ALLOCATED'
        END as allocation_status,
        STRING_AGG(DISTINCT il.lot_number, ', ') as allocated_from_lots
      FROM batch_cards bc
      JOIN batch_card_formulas bcf ON bc.id = bcf.batch_card_id
      JOIN raw_materials rm ON bcf.material_id = rm.id
      LEFT JOIN batch_card_allocations bca ON bc.id = bca.batch_card_id
      LEFT JOIN inventory_lots il ON bca.inventory_lot_id = il.id
      WHERE bc.id = $1
      GROUP BY rm.id, bcf.id
    `, [batchCardId]);
  }

  /**
   * Check Inventory Health
   */
  async getInventoryHealth() {
    return await db.query(`
      SELECT 
        COUNT(DISTINCT rmb.id) as total_batches,
        COUNT(DISTINCT CASE WHEN rmb.status = 'QUARANTINE' THEN rmb.id END) as quarantined_batches,
        COUNT(DISTINCT CASE WHEN rmb.status = 'REJECTED' THEN rmb.id END) as rejected_batches,
        COUNT(DISTINCT CASE WHEN rmb.expiry_date <= NOW() THEN rmb.id END) as expired_batches,
        COUNT(DISTINCT CASE WHEN rmb.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' THEN rmb.id END) as expiring_soon,
        SUM(il.quantity_on_hand) as total_quantity_stored,
        SUM(CASE WHEN il.state = 'APPROVED' AND rmb.expiry_date > NOW() THEN il.quantity_on_hand - il.quantity_reserved ELSE 0 END) as available_for_production
      FROM raw_material_batches rmb
      LEFT JOIN inventory_lots il ON rmb.id = il.material_batch_id
    `);
  }
}

export const inventoryService = new InventoryService();
