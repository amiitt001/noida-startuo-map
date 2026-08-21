/**
 * 404 Not Found Middleware
 */

import { Request, Response } from 'express';
import { sendError } from '../utils/response.js';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(sendError('NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`));
}
