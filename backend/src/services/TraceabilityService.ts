// ============================================================================
// TRACEABILITY & INVENTORY SERVICE
// Core business logic for material tracking with FEFO & QC gates
// ============================================================================

import { db } from '../config/database';
import { 
  RawMaterialStatus, 
  InventoryState, 
  QCResult,
  AllocationStatus 
} from '../utils/stateMachines';

export class TraceabilityService {
  /**
   * PROCUREMENT MODULE
   * Step 1: Create Purchase Order
   */
  async createPurchaseOrder(data: {
    supplierId: string;
    items: Array<{ materialId: string; quantity: number; unitPrice: number }>;
    expectedDeliveryDate: Date;
    createdBy: string;
  }) {
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const po = await db.query(
      `INSERT INTO purchase_orders (po_number, supplier_id, expected_delivery_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [poNumber, data.supplierId, data.expectedDeliveryDate, 'PENDING', data.createdBy]
    );

    // Insert line items
    for (const item of data.items) {
      const lineTotal = item.quantity * item.unitPrice;
      await db.query(
        `INSERT INTO purchase_order_items (po_id, material_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [po[0].id, item.materialId, item.quantity, item.unitPrice, lineTotal]
      );
    }

    // Audit log
    await this.logAudit('PurchaseOrder', po[0].id, 'CREATE', null, po[0], data.createdBy);

    return po[0];
  }

  /**
   * Step 2: Log Goods Receipt Note (GRN)
   * Material arrives and is placed in QUARANTINE
   */
  async logGoodsReceipt(data: {
    poId: string;
    items: Array<{
      materialId: string;
      quantityReceived: number;
      supplierBatchNo: string;
      manufacturingDate: Date;
      expiryDate: Date;
    }>;
    receivedBy: string;
  }) {
    const grnNumber = `GRN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const grn = await db.query(
      `INSERT INTO goods_receipt_notes (grn_number, po_id, status, received_by, received_date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [grnNumber, data.poId, 'RECEIVED', data.receivedBy]
    );

    // For each item in GRN, create a RawMaterialBatch in QUARANTINE
    const createdBatches = [];
    for (const item of data.items) {
      const batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create Raw Material Batch
      const batch = await db.query(
        `INSERT INTO raw_material_batches 
         (batch_number, material_id, supplier_id, manufacturing_date, expiry_date, quantity_received, status, created_by)
         VALUES ($1, $2, (SELECT supplier_id FROM purchase_orders WHERE id = $3), $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          batchNumber,
          item.materialId,
          data.poId,
          item.manufacturingDate,
          item.expiryDate,
          item.quantityReceived,
          'QUARANTINE', // *** QUARANTINE STATUS - NOT AVAILABLE ***
          data.receivedBy,
        ]
      );

      // Create Inventory Lot (main tracking unit)
      const lotNumber = `LOT-${batch[0].id.substring(0, 8)}-${Date.now()}`;
      const lot = await db.query(
        `INSERT INTO inventory_lots 
         (lot_number, material_batch_id, state, quantity_on_hand, quarantine_date)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [lotNumber, batch[0].id, 'QUARANTINE', item.quantityReceived]
      );

      createdBatches.push({
        batch: batch[0],
        lot: lot[0],
      });

      // Audit: Material received and quarantined
      await this.logAudit(
        'RawMaterialBatch',
        batch[0].id,
        'CREATE',
        null,
        { status: 'QUARANTINE', quantityReceived: item.quantityReceived },
        data.receivedBy
      );
    }

    return { grn: grn[0], batches: createdBatches };
  }

  /**
   * QUALITY CONTROL MODULE
   * Step 3: Log QC Test Results
   */
  async logQCTestResult(data: {
    materialBatchId: string;
    testParameters: any;
    results: any;
    result: 'PASSED' | 'FAILED';
    testedBy: string;
    approvedBy?: string;
  }) {
    const testNumber = `QC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const qcTest = await db.query(
      `INSERT INTO qc_test_results 
       (test_number, material_batch_id, test_parameters, results, result, tested_by, approved_by, approval_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        testNumber,
        data.materialBatchId,
        JSON.stringify(data.testParameters),
        JSON.stringify(data.results),
        data.result,
        data.testedBy,
        data.approvedBy || null,
        data.approvedBy ? new Date() : null,
      ]
    );

    // UPDATE batch status based on QC result
    if (data.result === 'PASSED') {
      // *** STATE CHANGE: QUARANTINE -> APPROVED ***
      await db.query(
        `UPDATE raw_material_batches 
         SET status = $1, qc_approved_date = NOW(), qc_approved_by = $2
         WHERE id = $3`,
        ['APPROVED', data.approvedBy, data.materialBatchId]
      );

      // Update inventory lot to APPROVED
      await db.query(
        `UPDATE inventory_lots 
         SET state = $1, approval_date = NOW()
         WHERE material_batch_id = $2`,
        ['APPROVED', data.materialBatchId]
      );

      await this.logAudit(
        'RawMaterialBatch',
        data.materialBatchId,
        'STATE_CHANGE',
        { status: 'QUARANTINE' },
        { status: 'APPROVED' },
        data.testedBy
      );
    } else {
      // *** STATE CHANGE: QUARANTINE -> REJECTED ***
      await db.query(
        `UPDATE raw_material_batches 
         SET status = $1, qc_rejected_date = NOW()
         WHERE id = $2`,
        ['REJECTED', data.materialBatchId]
      );

      // Update inventory lot to REJECTED
      await db.query(
        `UPDATE inventory_lots 
         SET state = $1
         WHERE material_batch_id = $2`,
        ['REJECTED', data.materialBatchId]
      );

      await this.logAudit(
        'RawMaterialBatch',
        data.materialBatchId,
        'STATE_CHANGE',
        { status: 'QUARANTINE' },
        { status: 'REJECTED' },
        data.testedBy
      );
    }

    return qcTest[0];
  }

  /**
   * PRODUCTION PLANNING MODULE
   * Step 4: Create Batch Card with FEFO allocation
   */
  async createBatchCard(data: {
    soId: string;
    productId: string;
    plannedQuantity: number;
    theoreticalYield: number;
    formulas: Array<{
      materialId: string;
      quantity: number;
      scrapPercent: number;
    }>;
    createdBy: string;
  }) {
    const batchCardNumber = `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Batch Card
    const batchCard = await db.query(
      `INSERT INTO batch_cards 
       (batch_card_number, so_id, product_id, planned_quantity, theoretical_yield, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        batchCardNumber,
        data.soId,
        data.productId,
        data.plannedQuantity,
        data.theoreticalYield,
        'PENDING',
        data.createdBy,
      ]
    );

    // For each formula, find approved inventory using FEFO
    for (const formula of data.formulas) {
      // Get approved inventory for this material, sorted by FEFO
      const approvedLots = await db.query(
        `SELECT il.* FROM inventory_lots il
         JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
         WHERE rmb.material_id = $1 AND il.state = $2
         ORDER BY rmb.expiry_date ASC
         LIMIT 100`,
        [formula.materialId, 'APPROVED']
      );

      if (approvedLots.length === 0) {
        throw new Error(`No approved inventory for material ${formula.materialId}`);
      }

      // Add formula entry linking to material batch
      const primaryBatch = approvedLots[0]; // FEFO - use earliest expiry first
      await db.query(
        `INSERT INTO batch_card_formulas 
         (batch_card_id, material_id, material_batch_id, quantity, scrap_percent)
         VALUES ($1, $2, $3, $4, $5)`,
        [batchCard[0].id, formula.materialId, primaryBatch.material_batch_id, formula.quantity, formula.scrapPercent]
      );

      // Allocate inventory lots (FEFO order)
      let remainingQuantity = formula.quantity;
      let allocationOrder = 1;

      for (const lot of approvedLots) {
        if (remainingQuantity <= 0) break;

        const allocateQty = Math.min(lot.quantity_on_hand, remainingQuantity);

        await db.query(
          `INSERT INTO batch_card_allocations 
           (batch_card_id, inventory_lot_id, allocated_quantity, status, allocation_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [batchCard[0].id, lot.id, allocateQty, 'ALLOCATED', allocationOrder]
        );

        // Update inventory lot state to ALLOCATED
        await db.query(
          `UPDATE inventory_lots SET state = $1, quantity_reserved = quantity_reserved + $2 WHERE id = $3`,
          ['ALLOCATED', allocateQty, lot.id]
        );

        remainingQuantity -= allocateQty;
        allocationOrder++;
      }

      if (remainingQuantity > 0) {
        throw new Error(
          `Insufficient approved inventory for material. Missing: ${remainingQuantity} units`
        );
      }
    }

    await this.logAudit('BatchCard', batchCard[0].id, 'CREATE', null, batchCard[0], data.createdBy);

    return batchCard[0];
  }

  /**
   * PRODUCTION MODULE
   * Step 5: Log Production Execution & Consumption
   */
  async logProductionConsumption(data: {
    batchCardId: string;
    inventoryLotId: string;
    quantityConsumed: number;
    loggedBy: string;
  }) {
    // Record consumption
    const log = await db.query(
      `INSERT INTO production_logs 
       (batch_card_id, inventory_lot_id, quantity_consumed, logged_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.batchCardId, data.inventoryLotId, data.quantityConsumed, data.loggedBy]
    );

    // Update inventory lot
    await db.query(
      `UPDATE inventory_lots 
       SET quantity_on_hand = quantity_on_hand - $1,
           quantity_consumed = quantity_consumed + $1
       WHERE id = $2`,
      [data.quantityConsumed, data.inventoryLotId]
    );

    // If lot is fully consumed, update state
    const lot = await db.query(
      `SELECT * FROM inventory_lots WHERE id = $1`,
      [data.inventoryLotId]
    );

    if (lot[0].quantity_on_hand <= 0) {
      await db.query(
        `UPDATE inventory_lots SET state = $1 WHERE id = $2`,
        ['CONSUMED', data.inventoryLotId]
      );
    }

    return log[0];
  }

  /**
   * Step 6: Log Finished Goods Production
   * FG enters quarantine pending QC
   */
  async logFinishedGoodsProduction(data: {
    batchCardId: string;
    productId: string;
    quantityProduced: number;
    scrapQuantity: number;
    operatorId: string;
  }) {
    const fgBatchNumber = `FG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create FG batch in QUARANTINE
    const fgBatch = await db.query(
      `INSERT INTO finished_goods_batches 
       (fg_batch_number, production_execution_id, product_id, quantity_produced, production_date, expiry_date, state, qc_status)
       VALUES ($1, (SELECT id FROM production_execution WHERE batch_card_id = $2), $3, $4, NOW(), NOW() + INTERVAL '365 days', $5, $6)
       RETURNING *`,
      [fgBatchNumber, data.batchCardId, data.productId, data.quantityProduced, 'QUARANTINE', 'PENDING']
    );

    await this.logAudit(
      'FinishedGoodsBatch',
      fgBatch[0].id,
      'CREATE',
      null,
      { state: 'QUARANTINE', qcStatus: 'PENDING' },
      data.operatorId
    );

    return fgBatch[0];
  }

  /**
   * DISPATCH MODULE
   * Step 7: Create Delivery Note & Store Issue Voucher
   */
  async createDeliveryAndIssueVoucher(data: {
    soId: string;
    fgBatchId: string;
    quantityToDispatch: number;
    issuedBy: string;
  }) {
    const dnNumber = `DN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const sivNumber = `SIV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Delivery Note
    const dn = await db.query(
      `INSERT INTO delivery_notes (dn_number, so_id, status, created_by, delivery_date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [dnNumber, data.soId, 'PENDING', data.issuedBy]
    );

    // Add DN item
    await db.query(
      `INSERT INTO delivery_note_items (dn_id, fg_batch_id, quantity_dispatched)
       VALUES ($1, $2, $3)`,
      [dn[0].id, data.fgBatchId, data.quantityToDispatch]
    );

    // Create Store Issue Voucher (official dispatch)
    const siv = await db.query(
      `INSERT INTO store_issue_vouchers 
       (siv_number, dn_id, fg_batch_id, quantity_issued, issued_by, issued_date)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [sivNumber, dn[0].id, data.fgBatchId, data.quantityToDispatch, data.issuedBy]
    );

    // Update FG batch state: APPROVED -> DISPATCHED
    await db.query(
      `UPDATE finished_goods_batches 
       SET state = $1, quantity_dispatched = quantity_dispatched + $2
       WHERE id = $3`,
      ['DISPATCHED', data.quantityToDispatch, data.fgBatchId]
    );

    await this.logAudit(
      'FinishedGoodsBatch',
      data.fgBatchId,
      'DISPATCH',
      { state: 'APPROVED' },
      { state: 'DISPATCHED', quantityDispatched: data.quantityToDispatch },
      data.issuedBy
    );

    return { deliveryNote: dn[0], storeIssueVoucher: siv[0] };
  }

  /**
   * Generate Certificate of Analysis (COA)
   */
  async generateCertificateOfAnalysis(data: {
    fgBatchId: string;
    testResults: any;
    certifiedBy: string;
  }) {
    const coaNumber = `COA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const coa = await db.query(
      `INSERT INTO certificates_of_analysis 
       (coa_number, fg_batch_id, test_results, certified_by, certification_date, test_date)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [coaNumber, data.fgBatchId, JSON.stringify(data.testResults), data.certifiedBy]
    );

    return coa[0];
  }

  /**
   * Full Traceability Query
   * Track a finished good back to its source materials
   */
  async getFullTraceability(fgBatchId: string) {
    return await db.query(
      `SELECT 
        fgb.fg_batch_number,
        fgb.state,
        fgb.quantity_produced,
        bc.batch_card_number,
        bc.planned_quantity,
        bc.theoretical_yield,
        bca.allocated_quantity,
        il.lot_number,
        rmb.batch_number as raw_batch_number,
        rm.name as material_name,
        rmb.manufacturing_date,
        rmb.expiry_date,
        s.name as supplier_name,
        pl.quantity_consumed,
        dn.dn_number,
        siv.siv_number,
        coa.coa_number
       FROM finished_goods_batches fgb
       LEFT JOIN production_execution pe ON fgb.production_execution_id = pe.id
       LEFT JOIN batch_cards bc ON pe.batch_card_id = bc.id
       LEFT JOIN batch_card_allocations bca ON bc.id = bca.batch_card_id
       LEFT JOIN inventory_lots il ON bca.inventory_lot_id = il.id
       LEFT JOIN raw_material_batches rmb ON il.material_batch_id = rmb.id
       LEFT JOIN raw_materials rm ON rmb.material_id = rm.id
       LEFT JOIN suppliers s ON rmb.supplier_id = s.id
       LEFT JOIN production_logs pl ON il.id = pl.inventory_lot_id
       LEFT JOIN delivery_note_items dni ON fgb.id = dni.fg_batch_id
       LEFT JOIN delivery_notes dn ON dni.dn_id = dn.id
       LEFT JOIN store_issue_vouchers siv ON dn.id = siv.dn_id
       LEFT JOIN certificates_of_analysis coa ON fgb.id = coa.fg_batch_id
       WHERE fgb.id = $1`,
      [fgBatchId]
    );
  }

  /**
   * Audit Logging
   */
  private async logAudit(
    entityType: string,
    entityId: string,
    action: string,
    oldValues: any,
    newValues: any,
    userId: string
  ) {
    await db.query(
      `INSERT INTO audit_logs 
       (entity_type, entity_id, action, old_values, new_values, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        entityType,
        entityId,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        userId,
      ]
    );
  }
}

export const traceabilityService = new TraceabilityService();
