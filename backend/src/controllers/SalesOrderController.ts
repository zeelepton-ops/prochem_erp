import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { SalesOrderModel } from '../models/SalesOrder';

export const createSalesOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { customerId, deliveryDate, totalAmount } = req.body;

    if (!customerId || !deliveryDate || !totalAmount) {
      throw new ValidationError('Missing required fields');
    }

    const soNumber = `SO-${Date.now()}`;

    const so = await SalesOrderModel.create({
      soNumber,
      customerId,
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      totalAmount,
      status: 'draft',
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: so,
      message: 'Sales order created successfully',
    } as ApiResponse);
  }
);

export const getSalesOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const so = await SalesOrderModel.findById(id);

    if (!so) {
      throw new NotFoundError('Sales order not found');
    }

    res.json({
      success: true,
      data: so,
    } as ApiResponse);
  }
);

export const getSalesOrders = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const offset = (page - 1) * limit;
    const sos = await SalesOrderModel.findAll(limit, offset);

    const total = sos.length; // Simplified for now

    res.json({
      success: true,
      data: {
        data: sos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      } as PaginatedResponse<any>,
    } as ApiResponse);
  }
);

export const updateSalesOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const so = await SalesOrderModel.findById(id);

    if (!so) {
      throw new NotFoundError('Sales order not found');
    }

    const updated = await SalesOrderModel.update(id, updates);

    res.json({
      success: true,
      data: updated,
      message: 'Sales order updated successfully',
    } as ApiResponse);
  }
);

export const deleteSalesOrder = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deleted = await SalesOrderModel.delete(id);

    if (!deleted) {
      throw new NotFoundError('Sales order not found');
    }

    res.json({
      success: true,
      message: 'Sales order deleted successfully',
    } as ApiResponse);
  }
);
