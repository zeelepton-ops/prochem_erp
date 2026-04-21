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
    const { startDate, endDate } = req.query;

    const report = await reportsService.getSupplierQualityReport(
      startDate ? new Date(startDate as string) : new Date(),
      endDate ? new Date(endDate as string) : new Date()
    );

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
      startDate: startDate as string,
      endDate: endDate as string,
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
    const report = await reportsService.getInventoryTurnoverReport();

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
    const report = await reportsService.getBatchConsumptionReport();

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
      startDate: startDate as string,
      endDate: endDate as string,
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
    const report = await reportsService.getExpiryRiskReport();

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

    if (!entityType || !entityId) {
      throw new ValidationError('Entity type and ID are required');
    }

    const trail = await reportsService.getAuditTrail(entityId, entityType);

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
