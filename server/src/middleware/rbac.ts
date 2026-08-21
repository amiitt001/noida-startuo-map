/**
 * Role-Based Access Control (RBAC) Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function requireRole(allowedRole: 'admin' | 'user') {
  return (req: Request, _res: Response, next: NextFunction) => {
    // 1. Unauthenticated -> 401 Unauthorized
    if (!req.user) {
      logger.security({
        event: 'RBAC_UNAUTHORIZED_ANONYMOUS',
        ip: req.ip,
        path: req.originalUrl,
      });
      return next(new UnauthorizedError('Authentication required'));
    }

    // 2. Insufficient permissions -> 403 Forbidden
    if (allowedRole === 'admin' && req.user.role !== 'admin') {
      logger.security({
        event: 'RBAC_FORBIDDEN_USER_ACCESS',
        userId: req.user.id,
        email: req.user.email,
        ip: req.ip,
        path: req.originalUrl,
        details: { requiredRole: allowedRole, actualRole: req.user.role },
      });
      return next(new ForbiddenError('Forbidden: admin privileges required'));
    }

    // 3. Allowed
    next();
  };
}
