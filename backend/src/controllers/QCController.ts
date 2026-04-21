// ============================================================================
// QUALITY CONTROL CONTROLLER
// QC Test Results, QC Gates, Approvals/Rejections
// ============================================================================

import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { QualityControlService } from '../services/QualityControlService';

const qcService = new QualityControlService();

/**
 * CREATE QC TEST RESULT
 * Log incoming or outgoing QC test
 */
export const createQCTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { testType, materialBatchId, fgBatchId, parameters } = req.body;

    if (!testType || !parameters) {
      throw new ValidationError('Missing required fields: testType, parameters');
    }

    const test = await qcService.createQCTest({
      materialBatchId,
      fgBatchId,
      testType,
      parameters,
      createdBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: test,
      message: 'QC test created successfully',
    } as ApiResponse);
  }
);

/**
 * GET QC TEST RESULT
 */
export const getQCTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const test = await qcService.getQCTest(id);

    if (!test) {
      throw new NotFoundError('QC test not found');
    }

    res.json({
      success: true,
      data: test,
    } as ApiResponse);
  }
);

/**
 * LIST QC TESTS
 * Filter by test type, status, batch
 */
export const listQCTests = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { testType, status } = req.query;

    const tests = await qcService.listQCTests({
      testType: testType as string,
      status: status as string,
    });

    res.json({
      success: true,
      data: tests,
    } as ApiResponse);
  }
);

/**
 * APPROVE QC TEST
 * Material/Product passes QC
 */
export const approveQCTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { comments, approvalDecision = 'APPROVED' } = req.body;

    const test = await qcService.approveQCTest({
      qcTestId: id,
      approvalDecision,
      comments,
      approvedBy: req.user?.userId || 'system',
    });

    res.json({
      success: true,
      data: test,
      message: 'QC test approved. Material/Product released for next stage.',
    } as ApiResponse);
  }
);

/**
 * REJECT QC TEST
 * Material/Product fails QC
 */
export const rejectQCTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new ValidationError('Rejection reason is required');
    }

    const test = await qcService.rejectQCTest(
      id,
      reason,
      req.user?.userId || 'system'
    );

    res.json({
      success: true,
      data: test,
      message: 'QC test rejected. Material/Product flagged for disposition.',
    } as ApiResponse);
  }
);

/**
 * GET INCOMING QC GATE STATUS
 * QC approval status for material batches before release to production
 */
export const getIncomingQCGate = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchId } = req.params;

    if (!batchId) {
      throw new ValidationError('Batch ID is required');
    }

    const gateStatus = await qcService.getIncomingQCGate(batchId);

    res.json({
      success: true,
      data: gateStatus,
    } as ApiResponse);
  }
);

/**
 * GET OUTGOING QC GATE STATUS
 * QC approval status for finished goods before dispatch
 */
export const getOutgoingQCGate = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { fgBatchId } = req.params;

    if (!fgBatchId) {
      throw new ValidationError('Finished goods batch ID is required');
    }

    const gateStatus = await qcService.getOutgoingQCGate(fgBatchId);

    res.json({
      success: true,
      data: gateStatus,
    } as ApiResponse);
  }
);

/**
 * GET QC PENDING ITEMS
 * Items awaiting QC approval
 */
export const getQCPendingItems = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const pendingItems = await qcService.getQCPendingItems();

    res.json({
      success: true,
      data: pendingItems,
    } as ApiResponse);
  }
);

/**
 * GET QC SUMMARY REPORT
 * Pass/fail statistics
 */
export const getQCReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { startDate, endDate, testType } = req.query;

    const report = await qcService.getQCReport({
      startDate: startDate as string,
      endDate: endDate as string,
      testType: testType as string,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);
