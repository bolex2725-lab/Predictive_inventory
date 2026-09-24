/**
 * Authentication and Multi-Tenant Security Middleware
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'nigerian-retail-sme-inventory-prediction-secret-key-2026';
const JWT_EXPIRES_IN = `${process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || '1440'}m`;

export interface AuthenticatedRequest extends Request {
  user?: User;
  businessId?: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return `${hash}:${salt}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [hash, salt] = storedHash.split(':');
    if (!hash || !salt) return false;
    const verify = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verify, 'hex'));
  } catch {
    return false;
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      business_id: user.business_id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing or invalid format',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = db.getUserById(payload.sub);

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account not found or deactivated',
      });
    }

    req.user = user;
    req.businessId = user.business_id;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session token',
    });
  }
}
