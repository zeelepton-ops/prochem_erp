import { Response, NextFunction } from 'express';
import { RequestWithUser, ApiResponse } from '../types';
import { asyncHandler, errorHandler } from '../middleware/errorHandler';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserModel } from '../models/User';

export const login = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Login successful',
    } as ApiResponse);
  }
);

export const register = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { email, password, name, firstName, lastName, department } = req.body;

    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : '');

    if (!email || !password || !fullName) {
      throw new ValidationError(
        'Email, password, and name (or firstName and lastName) are required'
      );
    }

    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      throw new ValidationError('Email already in use');
    }

    const user = await UserModel.create({
      email,
      password,
      name: fullName,
      department: department || 'Unassigned',
      role: 'operator',
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'User registered successfully',
    } as ApiResponse);
  }
);

export const getProfile = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw new ValidationError('User not found');
    }

    res.json({
      success: true,
      data: user,
    } as ApiResponse);
  }
);
