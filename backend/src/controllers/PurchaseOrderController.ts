import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { PurchaseOrderModel } from '../models/PurchaseOrder';
import { v4 as uuid } from 'uuid';

export const createPurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { supplierId, expectedDeliveryDate, totalAmount, items } = req.body;

    if (!supplierId || !expectedDeliveryDate || !totalAmount) {
      throw new ValidationError('Missing required fields');
    }

    const poNumber = `PO-${Date.now()}`;

    const po = await PurchaseOrderModel.create({
      poNumber,
      supplierId,
      orderDate: new Date(),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      totalAmount,
      status: 'draft',
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: po,
      message: 'Purchase order created successfully',
    } as ApiResponse);
  }
);

export const getPurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const po = await PurchaseOrderModel.findById(id);

    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    res.json({
      success: true,
      data: po,
    } as ApiResponse);
  }
);

export const getPurchaseOrders = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const offset = (page - 1) * limit;
    const pos = await PurchaseOrderModel.findAll(limit, offset, status);
    const total = await PurchaseOrderModel.count(status);

    res.json({
      success: true,
      data: {
        data: pos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      } as PaginatedResponse<any>,
    } as ApiResponse);
  }
);

export const updatePurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const po = await PurchaseOrderModel.findById(id);

    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    const updated = await PurchaseOrderModel.update(id, updates);

    res.json({
      success: true,
      data: updated,
      message: 'Purchase order updated successfully',
    } as ApiResponse);
  }
);

export const deletePurchaseOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deleted = await PurchaseOrderModel.delete(id);

    if (!deleted) {
      throw new NotFoundError('Purchase order not found');
    }

    res.json({
      success: true,
      message: 'Purchase order deleted successfully',
    } as ApiResponse);
  }
);
