// ============================================================================
// INVENTORY CONTROLLER
// FEFO Allocation, Inventory Management, Stock Tracking
// ============================================================================

import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { InventoryService } from '../services/InventoryService';

const inventoryService = new InventoryService();

/**
 * GET AVAILABLE INVENTORY FOR MATERIAL
 * Returns approved lots sorted by FEFO (expiry date)
 */
export const getAvailableInventory = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { materialId } = req.params;

    if (!materialId) {
      throw new ValidationError('Material ID is required');
    }

    const inventory = await inventoryService.getAvailableInventory(materialId);

    res.json({
      success: true,
      data: inventory,
    } as ApiResponse);
  }
);

/**
 * ALLOCATE INVENTORY WITH FEFO STRATEGY
 * Allocates material to batch card using First Expired First Out
 */
export const allocateInventoryFEFO = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId, materialId, requiredQuantity } = req.body;

    if (!batchCardId || !materialId || !requiredQuantity) {
      throw new ValidationError('Missing required fields: batchCardId, materialId, requiredQuantity');
    }

    const allocations = await inventoryService.allocateWithFEFO({
      batchCardId,
      materialId,
      requiredQuantity,
      allocatedBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: allocations,
      message: 'Inventory allocated successfully using FEFO strategy',
    } as ApiResponse);
  }
);

/**
 * GET ALLOCATION DETAILS
 */
export const getAllocationDetails = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId } = req.params;

    if (!batchCardId) {
      throw new ValidationError('Batch card ID is required');
    }

    const allocations = await inventoryService.getAllocationDetails(batchCardId);

    res.json({
      success: true,
      data: allocations,
    } as ApiResponse);
  }
);

/**
 * GET INVENTORY LOT DETAIL
 * Complete lot status and history
 */
export const getInventoryLotDetail = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { lotId } = req.params;

    if (!lotId) {
      throw new ValidationError('Lot ID is required');
    }

    const lot = await inventoryService.getInventoryLotDetail(lotId);

    if (!lot) {
      throw new NotFoundError('Inventory lot not found');
    }

    res.json({
      success: true,
      data: lot,
    } as ApiResponse);
  }
);

/**
 * LIST INVENTORY LOTS
 * Filter by state, material, supplier
 */
export const listInventoryLots = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { state, materialId, supplierId, skip = 0, limit = 20 } = req.query;

    const lots = await inventoryService.listInventoryLots({
      status: state as string,
      materialId: materialId as string,
      supplierId: supplierId as string,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: lots,
    } as ApiResponse);
  }
);

/**
 * UPDATE LOT STATE
 * Transition lot through states (QUARANTINE → APPROVED → ALLOCATED → CONSUMED)
 */
export const updateLotState = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { lotId } = req.params;
    const { newState, approvedBy } = req.body;

    if (!lotId || !newState) {
      throw new ValidationError('Lot ID and new state are required');
    }

    const lot = await inventoryService.updateLotState(
      lotId,
      newState,
      approvedBy || req.user?.userId || 'system'
    );

    res.json({
      success: true,
      data: lot,
      message: `Lot state transitioned to ${newState}`,
    } as ApiResponse);
  }
);

/**
 * GET STOCK SUMMARY
 * Overview of total inventory by material
 */
export const getStockSummary = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const summary = await inventoryService.getStockSummary();

    res.json({
      success: true,
      data: summary,
    } as ApiResponse);
  }
);

/**
 * GET EXPIRY ALERTS
 * Materials expiring within N days
 */
export const getExpiryAlerts = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { daysFromNow = 30 } = req.query;

    const alerts = await inventoryService.getExpiryAlerts(parseInt(daysFromNow as string));

    res.json({
      success: true,
      data: alerts,
    } as ApiResponse);
  }
);
