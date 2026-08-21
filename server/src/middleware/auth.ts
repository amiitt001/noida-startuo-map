/**
 * Authentication Middleware
 *
 * Verifies server-side sessions using HTTP-only cookies (or Authorization Bearer header).
 * Never trusts client-sent user state.
 */

import { Request, Response, NextFunction } from 'express';
import { userRepo } from '../repositories/userRepo.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Extend Express Request interface to hold user & session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
      };
      sessionToken?: string;
    }
  }
}

/**
 * Extract session token from HTTP-only cookie or Authorization header.
 */
function extractToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies?.sid) {
    return req.cookies.sid;
  }
  if (req.cookies?.session_token) {
    return req.cookies.session_token;
  }

  // 2. Fallback to Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Strict authentication middleware. Rejects unauthenticated requests with 401.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      logger.security({
        event: 'AUTH_FAILURE_NO_TOKEN',
        ip: req.ip,
        path: req.originalUrl,
      });
      return next(new UnauthorizedError('Authentication required'));
    }

    const session = await userRepo.findSessionByToken(token);
    if (!session || !session.user) {
      logger.security({
        event: 'AUTH_FAILURE_INVALID_SESSION',
        ip: req.ip,
        path: req.originalUrl,
      });
      return next(new UnauthorizedError('Session invalid or expired'));
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      // Invalidate expired session in background
      await userRepo.deleteSession(token).catch(() => {});
      logger.security({
        event: 'AUTH_FAILURE_EXPIRED_SESSION',
        userId: session.userId,
        ip: req.ip,
        path: req.originalUrl,
      });
      return next(new UnauthorizedError('Session expired, please log in again'));
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as 'user' | 'admin',
    };
    req.sessionToken = token;

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication middleware. Populates req.user if session valid, but proceeds if anonymous.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const session = await userRepo.findSessionByToken(token);
    if (session && session.user && session.expiresAt > new Date()) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as 'user' | 'admin',
      };
      req.sessionToken = token;
    }
    next();
  } catch (_err) {
    // Non-blocking for optional auth
    next();
  }
}
