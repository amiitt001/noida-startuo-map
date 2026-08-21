/**
 * Zod Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new BadRequestError('Validation failed', fieldErrors));
      } else {
        next(err);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new BadRequestError('Invalid query parameters', fieldErrors));
      } else {
        next(err);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new BadRequestError('Invalid URL parameters', err.errors));
      } else {
        next(err);
      }
    }
  };
}
