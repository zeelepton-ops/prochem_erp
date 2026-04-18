// ============================================================================
// REPORTS CONTROLLER
// Traceability Reports, Analytics, Compliance Reports
// ============================================================================

import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';
import { ReportsService } from '../services/ReportsService';

const reportsService = new ReportsService();

/**
 * GET BATCH TRACEABILITY REPORT
 * Complete material batch journey (forward and backward)
 */
export const getBatchTraceability = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchId } = req.params;

    if (!batchId) {
      throw new ValidationError('Batch ID is required');
    }

    const traceability = await reportsService.getBatchTraceability(batchId);

    res.json({
      success: true,
      data: traceability,
    } as ApiResponse);
  }
);

/**
 * GET PRODUCT TRACEABILITY REPORT
 * Where did materials for this product come from?
 */
export const getProductTraceability = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productBatchId } = req.params;

    if (!productBatchId) {
      throw new ValidationError('Product batch ID is required');
    }

    const traceability = await reportsService.getProductTraceability(productBatchId);

    res.json({
      success: true,
      data: traceability,
    } as ApiResponse);
  }
);

/**
 * GET SUPPLIER QUALITY REPORT
 * QC performance by supplier
 */
export const getSupplierQualityReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { supplierId } = req.params;
    const { startDate, endDate } = req.query;

    if (!supplierId) {
      throw new ValidationError('Supplier ID is required');
    }

    const report = await reportsService.getSupplierQualityReport({
      supplierId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET PRODUCTION EFFICIENCY REPORT
 * Yield analysis by product/batch
 */
export const getProductionEfficiencyReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { productId, startDate, endDate } = req.query;

    const report = await reportsService.getProductionEfficiencyReport({
      productId: productId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET INVENTORY TURNOVER REPORT
 * Stock movement and velocity
 */
export const getInventoryTurnoverReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { materialId } = req.query;

    const report = await reportsService.getInventoryTurnoverReport(
      materialId as string
    );

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET BATCH CONSUMPTION REPORT
 * Which batches consumed which materials
 */
export const getBatchConsumptionReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { batchCardId } = req.params;

    if (!batchCardId) {
      throw new ValidationError('Batch card ID is required');
    }

    const report = await reportsService.getBatchConsumptionReport(batchCardId);

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET MATERIAL GENEALOGY REPORT
 * All batches and products made from a material batch
 */
export const getMaterialGenealogyReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { materialBatchId } = req.params;

    if (!materialBatchId) {
      throw new ValidationError('Material batch ID is required');
    }

    const report = await reportsService.getMaterialGenealogyReport(materialBatchId);

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET COMPLIANCE REPORT
 * ISO 9001 / QC compliance metrics
 */
export const getComplianceReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const report = await reportsService.getComplianceReport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET EXPIRY RISK REPORT
 * Materials expiring soon
 */
export const getExpiryRiskReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { daysFromNow = 30 } = req.query;

    const report = await reportsService.getExpiryRiskReport(
      parseInt(daysFromNow as string)
    );

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);

/**
 * GET AUDIT TRAIL
 * Complete change history for entity
 */
export const getAuditTrail = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { entityType, entityId } = req.params;
    const { skip = 0, limit = 100 } = req.query;

    if (!entityType || !entityId) {
      throw new ValidationError('Entity type and ID are required');
    }

    const trail = await reportsService.getAuditTrail({
      entityType,
      entityId,
      skip: parseInt(skip as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: trail,
    } as ApiResponse);
  }
);

/**
 * GET DASHBOARD METRICS
 * Key performance indicators
 */
export const getDashboardMetrics = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const metrics = await reportsService.getDashboardMetrics();

    res.json({
      success: true,
      data: metrics,
    } as ApiResponse);
  }
);
