import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { DeliveryNoteModel } from '../models/DeliveryNote';

export const createDeliveryNote = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const {
      dnNumber,
      soId,
      deliveredBy,
      deliveredDate,
      items,
      remarks,
      totalAmount,
    } = req.body;

    if (!dnNumber || !soId || !deliveredBy || !deliveredDate || !items || items.length === 0) {
      throw new ValidationError('All required fields must be provided');
    }

    // Validate batch allocations
    for (const item of items) {
      if (!item.batchAllocations || item.batchAllocations.length === 0) {
        throw new ValidationError(`Batch allocations required for ${item.productName}`);
      }

      const totalAllocated = item.batchAllocations.reduce((sum: number, alloc: any) => sum + alloc.allocatedQuantity, 0);
      if (totalAllocated !== item.quantityDelivered) {
        throw new ValidationError(`Batch allocation quantity mismatch for ${item.productName}`);
      }
    }

    const delivery = await DeliveryNoteModel.create({
      dnNumber,
      soId,
      deliveredBy,
      deliveredDate: new Date(deliveredDate),
      status: 'DELIVERED',
      items,
      remarks,
      totalAmount,
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: delivery,
      message: 'Delivery note created successfully',
    } as ApiResponse);
  }
);

export const getDeliveryNote = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const delivery = await DeliveryNoteModel.findById(id);

    if (!delivery) {
      throw new NotFoundError('Delivery note not found');
    }

    res.json({
      success: true,
      data: delivery,
    } as ApiResponse);
  }
);

export const getDeliveryNotes = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const offset = (page - 1) * limit;
    const deliveries = await DeliveryNoteModel.findAll(limit, offset);

    res.json({
      success: true,
      data: {
        data: deliveries,
        total: deliveries.length,
        page,
        limit,
        totalPages: Math.ceil(deliveries.length / limit),
      } as PaginatedResponse<any>,
    } as ApiResponse);
  }
);

export const updateDeliveryNote = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const delivery = await DeliveryNoteModel.findById(id);

    if (!delivery) {
      throw new NotFoundError('Delivery note not found');
    }

    const updated = await DeliveryNoteModel.update(id, updates);

    res.json({
      success: true,
      data: updated,
      message: 'Delivery note updated successfully',
    } as ApiResponse);
  }
);

export const deleteDeliveryNote = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deleted = await DeliveryNoteModel.delete(id);

    if (!deleted) {
      throw new NotFoundError('Delivery note not found');
    }

    res.json({
      success: true,
      message: 'Delivery note deleted successfully',
    } as ApiResponse);
  }
);
