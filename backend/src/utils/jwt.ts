import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload } from '../types';

const secret: string = config.jwt.secret;

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, secret, {
    expiresIn: config.jwt.expiry as string,
  } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
