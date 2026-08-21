/**
 * Job Public Router
 */

import { Router } from 'express';
import { jobService } from '../services/jobService.js';
import { validateQuery } from '../middleware/validate.js';
import { jobQuerySchema } from '../schemas/jobSchemas.js';
import { sendSuccess } from '../utils/response.js';

export const jobsRouter = Router();

/**
 * GET /api/jobs
 */
jobsRouter.get('/', validateQuery(jobQuerySchema), async (req, res, next) => {
  try {
    const filters = req.query as any;
    const jobs = await jobService.getAllJobs(filters);
    res.json(sendSuccess(jobs));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/:id
 */
jobsRouter.get('/:id', async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json(sendSuccess(job));
  } catch (err) {
    next(err);
  }
});
