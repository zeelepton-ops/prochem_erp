// ============================================================================
// PRODUCTION CONTROLLER
// Batch Cards, Production Execution, Yield Tracking
// ============================================================================

import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { ProductionService } from '../services/ProductionService';
import { db } from '../config/database';

const productionService = new ProductionService();

/**
 * CREATE BATCH CARD
 * Initialize production for sales order
 */
export const createBatchCard = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new ValidationError('Missing required fields: productId, quantity');
    }

    const batchCard = await productionService.createBatchCard({
      productId: productId as string,
      quantity: parseInt(quantity as string),
      createdBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: batchCard,
      message: 'Batch card created successfully',
    } as ApiResponse);
  }
);

/**
 * GET BATCH CARD
 */
export const getBatchCard = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const batchCard = await productionService.getBatchCard(id);

    if (!batchCard) {
      throw new NotFoundError('Batch card not found');
    }

    res.json({
      success: true,
      data: batchCard,
    } as ApiResponse);
  }
);

/**
 * LIST BATCH CARDS
 * Filter by status, product, sales order
 */
export const listBatchCards = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { status, productId, salesOrderId } = req.query;

    const batchCards = await productionService.listBatchCards({
      status: status as string,
      productId: productId as string,
      salesOrderId: salesOrderId as string,
    });

    res.json({
      success: true,
      data: batchCards,
    } as ApiResponse);
  }
);

/**
 * RELEASE BATCH CARD FOR PRODUCTION
 * Transitions from PENDING to RELEASED
 */
export const releaseBatchCard = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const batchCard = await productionService.releaseBatchCard(id);

    res.json({
      success: true,
      data: batchCard,
      message: 'Batch card released for production',
    } as ApiResponse);
  }
);

/**
 * START PRODUCTION EXECUTION
 * Log actual production start
 */
export const startProduction = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId, operatorId, shiftNumber } = req.body;

    if (!batchCardId) {
      throw new ValidationError('Batch card ID is required');
    }

    const execution = await productionService.startProduction({
      batchCardId,
      operatorId: operatorId || req.user?.userId || 'system',
      shiftNumber: shiftNumber || 'SHIFT_1',
    });

    res.status(201).json({
      success: true,
      data: execution,
      message: 'Production started',
    } as ApiResponse);
  }
);

/**
 * LOG MATERIAL CONSUMPTION
 * Record inventory consumed during production
 */
export const logMaterialConsumption = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId, inventoryLotId, quantityConsumed } = req.body;

    if (!batchCardId || !inventoryLotId || !quantityConsumed) {
      throw new ValidationError('Missing required fields: batchCardId, inventoryLotId, quantityConsumed');
    }

    const log = await productionService.logMaterialConsumption({
      batchCardId,
      inventoryLotId,
      quantityConsumed,
      timestamp: new Date(),
      loggedBy: req.user?.userId || 'system',
    });

    res.status(201).json({
      success: true,
      data: log,
      message: 'Material consumption logged',
    } as ApiResponse);
  }
);

/**
 * COMPLETE PRODUCTION
 * End production and record actual yield
 */
export const completeProduction = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId, quantityProduced, scrapQuantity, comments } = req.body;

    if (!batchCardId || quantityProduced === undefined || scrapQuantity === undefined) {
      throw new ValidationError('Missing required fields: batchCardId, quantityProduced, scrapQuantity');
    }

    const batchCard = await productionService.completeProduction({
      batchCardId,
      quantityProduced,
      scrapQuantity,
      comments,
      completedBy: req.user?.userId || 'system',
    });

    res.json({
      success: true,
      data: batchCard,
      message: 'Production completed. Results pending QC approval.',
    } as ApiResponse);
  }
);

/**
 * GET PRODUCTION LOGS
 * Material consumption history for batch card
 */
export const getProductionLogs = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId } = req.params;

    if (!batchCardId) {
      throw new ValidationError('Batch card ID is required');
    }

    const logs = await productionService.getProductionLogs(batchCardId);

    res.json({
      success: true,
      data: logs,
    } as ApiResponse);
  }
);

/**
 * GET PRODUCTION DASHBOARD
 * Summary of current production status
 */
export const getProductionDashboard = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const dashboard = await productionService.getProductionDashboard();

    res.json({
      success: true,
      data: dashboard,
    } as ApiResponse);
  }
);

/**
 * GET YIELD ANALYSIS
 * Production efficiency metrics
 */
export const getYieldAnalysis = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productId, startDate, endDate } = req.query;

    const analysis = await productionService.getYieldAnalysis({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: analysis,
    } as ApiResponse);
  }
);

export const getProductionList = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const offset = (page - 1) * limit;
    const productions = await productionService.listBatchCards({
      status: status as string
    });

    res.json({
      success: true,
      data: {
        data: productions,
        total: productions.length,
        page,
        limit,
        totalPages: Math.ceil(productions.length / limit),
      },
    } as ApiResponse);
  }
);

export const updateProduction = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const production = await productionService.getBatchCard(id);

    if (!production || !production.rows || production.rows.length === 0) {
      throw new NotFoundError('Production not found');
    }

    const updated = await productionService.releaseBatchCard(id);

    res.json({
      success: true,
      data: updated,
      message: 'Production updated successfully',
    } as ApiResponse);
  }
);

export const deleteProduction = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const production = await productionService.getBatchCard(id);

    if (!production || !production.rows || production.rows.length === 0) {
      throw new NotFoundError('Production not found');
    }

    // Perform soft delete or archive the batch card
    const deleted = await db.query(
      `UPDATE batch_cards SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      message: 'Production deleted successfully',
    } as ApiResponse);
  }
);
