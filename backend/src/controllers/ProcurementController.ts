// ============================================================================
// PROCUREMENT CONTROLLER
// Purchase Orders, GRN, Supplier Management
// ============================================================================

import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { TraceabilityService } from '../services/TraceabilityService';

const traceabilityService = new TraceabilityService();

/**
 * CREATE PURCHASE ORDER
 * Step 1 in procurement workflow
 */
export const createPurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { supplierId, items, expectedDeliveryDate } = req.body;

    if (!supplierId || !items || items.length === 0 || !expectedDeliveryDate) {
      throw new ValidationError('Missing required fields: supplierId, items, expectedDeliveryDate');
    }

    const po = await traceabilityService.createPurchaseOrder({
      supplierId,
      items,
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      createdBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: po,
      message: 'Purchase order created successfully',
    } as ApiResponse);
  }
);

/**
 * GET PURCHASE ORDER
 */
export const getPurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const po = await traceabilityService.getPurchaseOrder(id);

    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    res.json({
      success: true,
      data: po,
    } as ApiResponse);
  }
);

/**
 * LIST ALL PURCHASE ORDERS
 */
export const listPurchaseOrders = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { status, supplierId, skip = 0, limit = 20 } = req.query;

    const pos = await traceabilityService.listPurchaseOrders({
      status: status as string,
      supplierId: supplierId as string,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: pos,
    } as ApiResponse);
  }
);

/**
 * UPDATE PURCHASE ORDER STATUS
 */
export const updatePurchaseOrderStatus = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const po = await traceabilityService.updatePurchaseOrderStatus(id, status, req.user?.userId || 'system');

    res.json({
      success: true,
      data: po,
      message: 'Purchase order status updated',
    } as ApiResponse);
  }
);

/**
 * LOG GOODS RECEIPT NOTE (GRN)
 * Step 2 in procurement - material placed in QUARANTINE
 */
export const logGoodsReceipt = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { poId, items } = req.body;

    if (!poId || !items || items.length === 0) {
      throw new ValidationError('Missing required fields: poId, items');
    }

    const grn = await traceabilityService.logGoodsReceipt({
      poId,
      items,
      receivedBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: grn,
      message: 'Goods receipt note logged successfully. Material in QUARANTINE.',
    } as ApiResponse);
  }
);

/**
 * GET GRN
 */
export const getGoodsReceipt = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const grn = await traceabilityService.getGoodsReceipt(id);

    if (!grn) {
      throw new NotFoundError('Goods receipt note not found');
    }

    res.json({
      success: true,
      data: grn,
    } as ApiResponse);
  }
);

/**
 * LIST ALL GRNs
 */
export const listGoodsReceipts = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { status, skip = 0, limit = 20 } = req.query;

    const grns = await traceabilityService.listGoodsReceipts({
      status: status as string,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: grns,
    } as ApiResponse);
  }
);

/**
 * GET MATERIAL BATCHES (after GRN)
 * Shows all batches in various states
 */
export const getMaterialBatches = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { materialId, status, skip = 0, limit = 20 } = req.query;

    const batches = await traceabilityService.getMaterialBatches({
      materialId: materialId as string,
      status: status as string,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: batches,
    } as ApiResponse);
  }
);

/**
 * GET MATERIAL BATCH DETAIL
 */
export const getMaterialBatch = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const batch = await traceabilityService.getMaterialBatch(id);

    if (!batch) {
      throw new NotFoundError('Material batch not found');
    }

    res.json({
      success: true,
      data: batch,
    } as ApiResponse);
  }
);

/**
 * GET MATERIAL BATCH TRACEABILITY
 * Full history and state transitions
 */
export const getBatchTraceability = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const traceability = await traceabilityService.getBatchTraceability(id);

    if (!traceability) {
      throw new NotFoundError('Batch not found');
    }

    res.json({
      success: true,
      data: traceability,
    } as ApiResponse);
  }
);
