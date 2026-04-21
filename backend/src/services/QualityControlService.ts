// ============================================================================
// QUALITY CONTROL SERVICE
// QC Gate enforcement for receiving and finished goods
// ============================================================================

import { db } from '../config/database';

export class QualityControlService {
  /**
   * Incoming QC - Test raw material batch
   * Raw material cannot proceed past QUARANTINE without QC approval
   */
  async performIncomingQC(data: {
    materialBatchId: string;
    parameters: {
      appearance: string;
      moistureContent?: number;
      packagingIntegrity: string;
      labelAccuracy: boolean;
      certification: boolean;
      customTests?: Record<string, any>;
    };
    testedBy: string;
  }) {
    // Validate batch exists and is in QUARANTINE
    const batch = await db.query(
      `SELECT * FROM raw_material_batches WHERE id = $1`,
      [data.materialBatchId]
    );

    if (batch.length === 0) {
      throw new Error('Material batch not found');
    }

    if (batch[0].status !== 'QUARANTINE') {
      throw new Error('Material batch must be in QUARANTINE for incoming QC');
    }

    // Perform QC
    const qcResult = await this.evaluateQCParameters(data.parameters);
    const testNumber = `QC-IN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const qcTest = await db.query(
      `INSERT INTO qc_test_results 
       (test_number, material_batch_id, test_parameters, results, result, tested_by, test_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        testNumber,
        data.materialBatchId,
        JSON.stringify(data.parameters),
        JSON.stringify(qcResult),
        qcResult.passed ? 'PASSED' : 'FAILED',
        data.testedBy,
        'INCOMING',
      ]
    );

    return {
      qcTest: qcTest[0],
      result: qcResult,
    };
  }

  /**
   * Outgoing QC - Test finished goods batch
   * FG cannot be dispatched without QC approval
   */
  async performOutgoingQC(data: {
    fgBatchId: string;
    parameters: {
      appearance: string;
      weight?: number;
      packaging: string;
      labelAccuracy: boolean;
      storageRequirements: string;
      customTests?: Record<string, any>;
    };
    testedBy: string;
  }) {
    // Validate FG batch exists and is in QUARANTINE
    const fgBatch = await db.query(
      `SELECT * FROM finished_goods_batches WHERE id = $1`,
      [data.fgBatchId]
    );

    if (fgBatch.length === 0) {
      throw new Error('Finished goods batch not found');
    }

    if (fgBatch[0].state !== 'QUARANTINE') {
      throw new Error('Finished goods batch must be in QUARANTINE for outgoing QC');
    }

    // Perform QC
    const qcResult = await this.evaluateQCParameters(data.parameters);
    const testNumber = `QC-OUT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const qcTest = await db.query(
      `INSERT INTO qc_test_results 
       (test_number, fg_batch_id, test_parameters, results, result, tested_by, test_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        testNumber,
        data.fgBatchId,
        JSON.stringify(data.parameters),
        JSON.stringify(qcResult),
        qcResult.passed ? 'PASSED' : 'FAILED',
        data.testedBy,
        'OUTGOING',
      ]
    );

    return {
      qcTest: qcTest[0],
      result: qcResult,
    };
  }

  /**
   * Approve QC Test
   * Transitions material/FG based on test result
   */
  async approveQCTest(data: {
    qcTestId: string;
    approvalDecision: 'APPROVED' | 'REJECTED';
    comments?: string;
    approvedBy: string;
  }) {
    // Get QC test
    const qcTest = await db.query(
      `SELECT * FROM qc_test_results WHERE id = $1`,
      [data.qcTestId]
    );

    if (qcTest.length === 0) {
      throw new Error('QC test not found');
    }

    const test = qcTest[0];

    // Record approval
    const approval = await db.query(
      `UPDATE qc_test_results 
       SET approval_decision = $1, comments = $2, approved_by = $3, approval_date = NOW()
       WHERE id = $4
       RETURNING *`,
      [data.approvalDecision, data.comments || null, data.approvedBy, data.qcTestId]
    );

    // Execute state transitions
    if (test.material_batch_id) {
      // Incoming QC - Material batch
      if (data.approvalDecision === 'APPROVED') {
        // QUARANTINE -> APPROVED
        await db.query(
          `UPDATE raw_material_batches 
           SET status = $1, qc_approved_date = NOW(), qc_approved_by = $2
           WHERE id = $3`,
          ['APPROVED', data.approvedBy, test.material_batch_id]
        );

        // Update inventory lot
        await db.query(
          `UPDATE inventory_lots SET state = $1 WHERE material_batch_id = $2`,
          ['APPROVED', test.material_batch_id]
        );
      } else {
        // QUARANTINE -> REJECTED
        await db.query(
          `UPDATE raw_material_batches 
           SET status = $1, qc_rejected_date = NOW()
           WHERE id = $2`,
          ['REJECTED', test.material_batch_id]
        );

        // Update inventory lot
        await db.query(
          `UPDATE inventory_lots SET state = $1 WHERE material_batch_id = $2`,
          ['REJECTED', test.material_batch_id]
        );
      }
    } else if (test.fg_batch_id) {
      // Outgoing QC - Finished goods batch
      if (data.approvalDecision === 'APPROVED') {
        // QUARANTINE -> APPROVED
        await db.query(
          `UPDATE finished_goods_batches 
           SET state = $1, qc_status = $2, qc_approved_date = NOW(), qc_approved_by = $3
           WHERE id = $4`,
          ['APPROVED', 'PASSED', data.approvedBy, test.fg_batch_id]
        );
      } else {
        // QUARANTINE -> REJECTED (batch scrapped)
        await db.query(
          `UPDATE finished_goods_batches 
           SET state = $1, qc_status = $2, qc_rejected_date = NOW()
           WHERE id = $3`,
          ['REJECTED', 'FAILED', test.fg_batch_id]
        );
      }
    }

    return approval[0];
  }

  /**
   * Internal: Evaluate QC parameters
   */
  private async evaluateQCParameters(parameters: Record<string, any>) {
    const results = {
      passed: true,
      checks: [] as any[],
      notes: [] as string[],
    };

    // Check appearance
    if (parameters.appearance) {
      const appearanceValid = ['GOOD', 'ACCEPTABLE', 'DAMAGED'].includes(parameters.appearance);
      results.checks.push({
        name: 'Appearance',
        value: parameters.appearance,
        status: appearanceValid && parameters.appearance !== 'DAMAGED' ? 'PASS' : 'FAIL',
      });
      if (parameters.appearance === 'DAMAGED') {
        results.passed = false;
        results.notes.push('Appearance damaged - batch rejected');
      }
    }

    // Check moisture content if provided
    if (parameters.moistureContent !== undefined) {
      const moistureValid = parameters.moistureContent >= 5 && parameters.moistureContent <= 15;
      results.checks.push({
        name: 'Moisture Content (%)',
        value: parameters.moistureContent,
        status: moistureValid ? 'PASS' : 'FAIL',
      });
      if (!moistureValid) {
        results.passed = false;
        results.notes.push(`Moisture content out of range: ${parameters.moistureContent}%`);
      }
    }

    // Check packaging integrity
    if (parameters.packagingIntegrity) {
      const packagingValid = ['INTACT', 'MINOR_DAMAGE', 'SEVERE_DAMAGE'].includes(
        parameters.packagingIntegrity
      );
      results.checks.push({
        name: 'Packaging Integrity',
        value: parameters.packagingIntegrity,
        status: packagingValid && parameters.packagingIntegrity !== 'SEVERE_DAMAGE' ? 'PASS' : 'FAIL',
      });
      if (parameters.packagingIntegrity === 'SEVERE_DAMAGE') {
        results.passed = false;
        results.notes.push('Severe packaging damage - batch rejected');
      }
    }

    // Check label accuracy
    if (parameters.labelAccuracy !== undefined) {
      results.checks.push({
        name: 'Label Accuracy',
        value: parameters.labelAccuracy,
        status: parameters.labelAccuracy ? 'PASS' : 'FAIL',
      });
      if (!parameters.labelAccuracy) {
        results.passed = false;
        results.notes.push('Label inaccurate - batch rejected');
      }
    }

    // Check certification
    if (parameters.certification !== undefined) {
      results.checks.push({
        name: 'Certification',
        value: parameters.certification,
        status: parameters.certification ? 'PASS' : 'FAIL',
      });
      if (!parameters.certification) {
        results.passed = false;
        results.notes.push('Required certification missing - batch rejected');
      }
    }

    // Custom tests
    if (parameters.customTests) {
      for (const [testName, testResult] of Object.entries(parameters.customTests)) {
        const customPassed = typeof testResult === 'boolean' ? testResult : true;
        results.checks.push({
          name: testName,
          value: testResult,
          status: customPassed ? 'PASS' : 'FAIL',
        });
        if (!customPassed) {
          results.passed = false;
          results.notes.push(`Custom test failed: ${testName}`);
        }
      }
    }

    return results;
  }

  /**
   * Get QC History for a batch
   */
  async getQCHistory(entityId: string, entityType: 'material' | 'fg') {
    const query =
      entityType === 'material'
        ? `SELECT * FROM qc_test_results WHERE material_batch_id = $1 ORDER BY created_at DESC`
        : `SELECT * FROM qc_test_results WHERE fg_batch_id = $1 ORDER BY created_at DESC`;

    return await db.query(query, [entityId]);
  }

  /**
   * Get pending QC batches
   */
  async getPendingQC() {
    return await db.query(
      `SELECT 'MATERIAL' as type, rmb.id, rmb.batch_number, rmb.status, rmb.received_date, qtr.test_type
       FROM raw_material_batches rmb
       LEFT JOIN qc_test_results qtr ON rmb.id = qtr.material_batch_id
       WHERE rmb.status = $1
       UNION
       SELECT 'FINISHED_GOODS' as type, fgb.id, fgb.fg_batch_number, fgb.state, fgb.production_date, 'OUTGOING'
       FROM finished_goods_batches fgb
       WHERE fgb.state = $1`,
      ['QUARANTINE']
    );
  }

  async getQCReport(filters?: { startDate?: string; endDate?: string; testType?: string }) {
    let query = `
      SELECT 
        qtr.*,
        rmb.material_name,
        rmb.batch_number as material_batch_number,
        fgb.batch_number as fg_batch_number,
        p.name as product_name
      FROM qc_test_results qtr
      LEFT JOIN raw_material_batches rmb ON qtr.material_batch_id = rmb.id
      LEFT JOIN finished_goods_batches fgb ON qtr.fg_batch_id = fgb.id
      LEFT JOIN products p ON fgb.product_id = p.id
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

    if (filters?.testType) {
      query += ` AND qtr.test_type = $${paramIndex}`;
      params.push(filters.testType);
      paramIndex++;
    }

    query += ' ORDER BY qtr.created_at DESC';

    return await db.query(query, params);
  }

  async createQCTest(data: { materialBatchId?: string; fgBatchId?: string; testType: string; parameters: any; createdBy: string }) {
    const result = await db.query(`
      INSERT INTO qc_test_results (material_batch_id, fg_batch_id, test_type, parameters, created_by, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING *
    `, [data.materialBatchId, data.fgBatchId, data.testType, JSON.stringify(data.parameters), data.createdBy]);
    return result.rows[0];
  }

  async getQCTest(id: string) {
    return await db.query(`
      SELECT 
        qtr.*,
        rmb.batch_number as material_batch_number,
        fgb.batch_number as fg_batch_number,
        u.name as created_by_name
      FROM qc_test_results qtr
      LEFT JOIN raw_material_batches rmb ON qtr.material_batch_id = rmb.id
      LEFT JOIN finished_goods_batches fgb ON qtr.fg_batch_id = fgb.id
      LEFT JOIN users u ON qtr.created_by = u.id
      WHERE qtr.id = $1
    `, [id]);
  }

  async listQCTests(filters?: { status?: string; testType?: string }) {
    let query = `
      SELECT 
        qtr.*,
        rmb.batch_number as material_batch_number,
        fgb.batch_number as fg_batch_number,
        u.name as created_by_name
      FROM qc_test_results qtr
      LEFT JOIN raw_material_batches rmb ON qtr.material_batch_id = rmb.id
      LEFT JOIN finished_goods_batches fgb ON qtr.fg_batch_id = fgb.id
      LEFT JOIN users u ON qtr.created_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND qtr.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.testType) {
      query += ` AND qtr.test_type = $${paramIndex}`;
      params.push(filters.testType);
      paramIndex++;
    }

    query += ' ORDER BY qtr.created_at DESC';

    return await db.query(query, params);
  }

  async rejectQCTest(id: string, reason: string, rejectedBy: string) {
    return await db.query(`
      UPDATE qc_test_results 
      SET status = 'REJECTED', rejection_reason = $1, rejected_by = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [reason, rejectedBy, id]);
  }

  async getIncomingQCGate(batchId: string) {
    return await db.query(`
      SELECT 
        qcg.*,
        rmb.batch_number,
        rmb.material_name,
        COUNT(DISTINCT qtr.id) as test_count,
        SUM(CASE WHEN qtr.status = 'PASSED' THEN 1 ELSE 0 END) as passed_count
      FROM qc_gates qcg
      LEFT JOIN raw_material_batches rmb ON qcg.entity_id = rmb.id
      LEFT JOIN qc_test_results qtr ON rmb.id = qtr.material_batch_id
      WHERE qcg.gate_type = 'INCOMING' AND qcg.entity_id = $1
      GROUP BY qcg.id, rmb.id
    `, [batchId]);
  }

  async getOutgoingQCGate(batchId: string) {
    return await db.query(`
      SELECT 
        qcg.*,
        fgb.batch_number,
        p.name as product_name,
        COUNT(DISTINCT qtr.id) as test_count,
        SUM(CASE WHEN qtr.status = 'PASSED' THEN 1 ELSE 0 END) as passed_count
      FROM qc_gates qcg
      LEFT JOIN finished_goods_batches fgb ON qcg.entity_id = fgb.id
      LEFT JOIN products p ON fgb.product_id = p.id
      LEFT JOIN qc_test_results qtr ON fgb.id = qtr.fg_batch_id
      WHERE qcg.gate_type = 'OUTGOING' AND qcg.entity_id = $1
      GROUP BY qcg.id, fgb.id, p.id
    `, [batchId]);
  }

  async getQCPendingItems() {
    return await db.query(`
      SELECT 
        qtr.*,
        CASE 
          WHEN qtr.material_batch_id IS NOT NULL THEN 'INCOMING'
          WHEN qtr.fg_batch_id IS NOT NULL THEN 'OUTGOING'
        END as gate_type,
        rmb.batch_number as material_batch_number,
        fgb.batch_number as fg_batch_number
      FROM qc_test_results qtr
      LEFT JOIN raw_material_batches rmb ON qtr.material_batch_id = rmb.id
      LEFT JOIN finished_goods_batches fgb ON qtr.fg_batch_id = fgb.id
      WHERE qtr.status IN ('PENDING', 'IN_PROGRESS')
      ORDER BY qtr.created_at ASC
    `);
  }
}

export const qualityControlService = new QualityControlService();
