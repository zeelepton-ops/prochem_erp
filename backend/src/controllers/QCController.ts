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
    const { testType, materialBatchId, testParameters, results } = req.body;

    if (!testType || !testParameters) {
      throw new ValidationError('Missing required fields: testType, testParameters');
    }

    const test = await qcService.createQCTest({
      testType,
      materialBatchId,
      testParameters,
      results,
      testedBy: req.user?.userId || 'system',
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
    const { testType, status, batchId, skip = 0, limit = 20 } = req.query;

    const tests = await qcService.listQCTests({
      testType: testType as string,
      status: status as string,
      batchId: batchId as string,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
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
    const { comments } = req.body;

    const test = await qcService.approveQCTest(
      id,
      req.user?.userId || 'system',
      comments
    );

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
    const { comments, reason } = req.body;

    if (!reason) {
      throw new ValidationError('Rejection reason is required');
    }

    const test = await qcService.rejectQCTest(
      id,
      req.user?.userId || 'system',
      reason,
      comments
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
    const { type = 'incoming' } = req.query;

    const pendingItems = await qcService.getQCPendingItems(type as string);

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
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      testType: testType as string,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);
