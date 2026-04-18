import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AuditLogModel } from '../models/AuditLog';

export const getAuditLogs = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { entityType, action, startDate, endDate } = req.query;

    const logs = await AuditLogModel.findAll({
      entityType: entityType as string,
      action: action as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      data: logs,
    } as ApiResponse);
  }
);

export const getAuditLogsByEntity = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { entityId } = req.params;

    const logs = await AuditLogModel.findByEntity(entityId);

    res.json({
      success: true,
      data: logs,
    } as ApiResponse);
  }
);

export const getAuditLogReport = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const report = await AuditLogModel.getReport({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      data: report,
    } as ApiResponse);
  }
);
