/**
 * Centralized Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(sendError(err.code, err.message, err.details));
  }

  // 2. Prisma Known Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma error code: ${err.code}`, err);
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json(sendError('CONFLICT', `A record with this ${target} already exists`));
    }
    if (err.code === 'P2025') {
      return res.status(404).json(sendError('NOT_FOUND', 'Record not found'));
    }
    return res.status(400).json(sendError('DATABASE_ERROR', 'Database constraint violation'));
  }

  // 3. Syntax / JSON parse errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    return res.status(400).json(sendError('VALIDATION_ERROR', 'Malformed JSON in request body'));
  }

  // 4. Unexpected server errors
  logger.error(`Unhandled error: ${err.message}`, err.stack);

  const message = config.isProduction
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(500).json(sendError('INTERNAL_SERVER_ERROR', message));
}
