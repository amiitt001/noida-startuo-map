/**
 * Submission Public Router
 */

import { Router } from 'express';
import { submissionService } from '../services/submissionService.js';
import { validateBody } from '../middleware/validate.js';
import { submissionCreateSchema } from '../schemas/submissionSchemas.js';
import { submissionRateLimiter } from '../middleware/rateLimit.js';
import { sendSuccess } from '../utils/response.js';

export const submissionsRouter = Router();

/**
 * POST /api/submissions
 *
 * Public submission endpoint. Validates strictly, forces PENDING status,
 * checks for duplicates. Never automatically publishes.
 */
submissionsRouter.post(
  '/',
  submissionRateLimiter,
  validateBody(submissionCreateSchema),
  async (req, res, next) => {
    try {
      const submission = await submissionService.createSubmission(req.body);
      res.status(201).json(sendSuccess(submission));
    } catch (err) {
      next(err);
    }
  }
);
