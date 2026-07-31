import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { verifyToken } from '../modules/auth/auth.utils';
import config from '../config';
import prisma from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not authorized to access this route');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Invalid authentication token');
    }

    const decoded = verifyToken(token, config.jwt.access_secret) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError(401, 'User account associated with this token no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'Your user account is suspended');
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  });
};

export default auth;
