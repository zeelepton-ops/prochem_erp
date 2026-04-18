import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../utils/errors';
import { MaterialTestModel } from '../models/MaterialTest';

export const createMaterialTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { rawMaterialId, batchNumber, testType, remarks } = req.body;

    if (!rawMaterialId || !batchNumber || !testType) {
      throw new ValidationError('Missing required fields');
    }

    const test = await MaterialTestModel.create({
      rawMaterialId,
      batchNumber,
      testDate: new Date(),
      testType,
      result: 'pending',
      remarks,
      testedBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: test,
      message: 'Material test created successfully',
    } as ApiResponse);
  }
);

export const getMaterialTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const test = await MaterialTestModel.findById(id);

    if (!test) {
      throw new NotFoundError('Material test not found');
    }

    res.json({
      success: true,
      data: test,
    } as ApiResponse);
  }
);

export const getMaterialTests = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const offset = (page - 1) * limit;
    const tests = await MaterialTestModel.findAll(limit, offset);

    res.json({
      success: true,
      data: {
        data: tests,
        total: tests.length,
        page,
        limit,
        totalPages: Math.ceil(tests.length / limit),
      } as PaginatedResponse<any>,
    } as ApiResponse);
  }
);

export const updateMaterialTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { result, remarks } = req.body;

    const test = await MaterialTestModel.findById(id);

    if (!test) {
      throw new NotFoundError('Material test not found');
    }

    const updated = await MaterialTestModel.update(id, { result, remarks });

    res.json({
      success: true,
      data: updated,
      message: 'Material test updated successfully',
    } as ApiResponse);
  }
);

export const deleteMaterialTest = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deleted = await MaterialTestModel.delete(id);

    if (!deleted) {
      throw new NotFoundError('Material test not found');
    }

    res.json({
      success: true,
      message: 'Material test deleted successfully',
    } as ApiResponse);
  }
);
