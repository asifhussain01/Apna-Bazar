import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User, IUser } from '../models/User';
import { isMongoConnected, inMemoryUsers } from '../services/inMemoryStore';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: 'customer' | 'admin';
}

interface JwtPayload {
  userId: string;
  role: 'customer' | 'admin';
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    if (!isMongoConnected()) {
      // In-Memory Fallback
      const user = inMemoryUsers.find(u => u._id === decoded.userId) || inMemoryUsers[0];
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated'
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      if (!isMongoConnected()) {
        const user = inMemoryUsers.find(u => u._id === decoded.userId) || inMemoryUsers[0];
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        return next();
      }

      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
      }
    }
  } catch (err) {
    // Gracefully ignore token errors for optional auth (e.g. guest mode)
  }
  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required'
    });
    return;
  }
  next();
};
