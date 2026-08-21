/**
 * Admin Router
 *
 * Protected server-side admin operations.
 * Enforces requireAuth + requireRole('admin') on every endpoint.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { submissionService } from '../services/submissionService.js';
import { startupService } from '../services/startupService.js';
import { founderService } from '../services/founderService.js';
import { investorService } from '../services/investorService.js';
import { jobService } from '../services/jobService.js';
import { submissionRepo } from '../repositories/submissionRepo.js';

import { startupCreateSchema, startupUpdateSchema } from '../schemas/startupSchemas.js';
import { founderCreateSchema, founderUpdateSchema } from '../schemas/founderSchemas.js';
import { investorCreateSchema, investorUpdateSchema } from '../schemas/investorSchemas.js';
import { jobCreateSchema, jobUpdateSchema } from '../schemas/jobSchemas.js';
import { submissionStatusUpdateSchema } from '../schemas/submissionSchemas.js';
import { sendSuccess } from '../utils/response.js';

export const adminRouter = Router();

// Apply Auth & RBAC to ALL admin routes
adminRouter.use(requireAuth);
adminRouter.use(requireRole('admin'));

/**
 * GET /api/admin/dashboard
 */
adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const submissionCounts = await submissionRepo.countByStatus();
    const startupsResult = await startupService.getAllStartups({}, 1, 1);
    const jobs = await jobService.getAllJobs({});

    res.json(
      sendSuccess({
        submissionCounts,
        totalStartups: startupsResult.totalCount,
        totalJobs: jobs.length,
      })
    );
  } catch (err) {
    next(err);
  }
});

// ─── Submissions ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/submissions
 */
adminRouter.get('/submissions', async (_req, res, next) => {
  try {
    const submissions = await submissionService.getAllSubmissions();
    res.json(sendSuccess(submissions));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/submissions/:id
 */
adminRouter.get('/submissions/:id', async (req, res, next) => {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    res.json(sendSuccess(submission));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/submissions/:id/status
 */
adminRouter.patch(
  '/submissions/:id/status',
  validateBody(submissionStatusUpdateSchema),
  async (req, res, next) => {
    try {
      const { status, notes, latitude, longitude } = req.body;
      const updated = await submissionService.updateStatus(req.params.id, status, notes, {
        latitude,
        longitude,
      });
      res.json(sendSuccess(updated));
    } catch (err) {
      next(err);
    }
  }
);

// ─── Startups ─────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/startups
 */
adminRouter.post('/startups', validateBody(startupCreateSchema), async (req, res, next) => {
  try {
    const startup = await startupService.createStartup(req.body);
    res.status(201).json(sendSuccess(startup));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/startups/:id
 */
adminRouter.patch('/startups/:id', validateBody(startupUpdateSchema), async (req, res, next) => {
  try {
    const updated = await startupService.updateStartup(req.params.id, req.body);
    res.json(sendSuccess(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/startups/:id
 */
adminRouter.delete('/startups/:id', async (req, res, next) => {
  try {
    const result = await startupService.deleteStartup(req.params.id);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/startups/:id/verify
 */
adminRouter.patch('/startups/:id/verify', async (req, res, next) => {
  try {
    const updated = await startupService.toggleVerified(req.params.id);
    res.json(sendSuccess(updated));
  } catch (err) {
    next(err);
  }
});

// ─── Founders ────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/founders
 */
adminRouter.post('/founders', validateBody(founderCreateSchema), async (req, res, next) => {
  try {
    const founder = await founderService.createFounder(req.body);
    res.status(201).json(sendSuccess(founder));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/founders/:id
 */
adminRouter.patch('/founders/:id', validateBody(founderUpdateSchema), async (req, res, next) => {
  try {
    const updated = await founderService.updateFounder(req.params.id, req.body);
    res.json(sendSuccess(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/founders/:id
 */
adminRouter.delete('/founders/:id', async (req, res, next) => {
  try {
    const result = await founderService.deleteFounder(req.params.id);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});

// ─── Investors ───────────────────────────────────────────────────────────────

/**
 * POST /api/admin/investors
 */
adminRouter.post('/investors', validateBody(investorCreateSchema), async (req, res, next) => {
  try {
    const investor = await investorService.createInvestor(req.body);
    res.status(201).json(sendSuccess(investor));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/investors/:id
 */
adminRouter.patch('/investors/:id', validateBody(investorUpdateSchema), async (req, res, next) => {
  try {
    const updated = await investorService.updateInvestor(req.params.id, req.body);
    res.json(sendSuccess(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/investors/:id
 */
adminRouter.delete('/investors/:id', async (req, res, next) => {
  try {
    const result = await investorService.deleteInvestor(req.params.id);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});

// ─── Jobs ────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/jobs
 */
adminRouter.post('/jobs', validateBody(jobCreateSchema), async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body);
    res.status(201).json(sendSuccess(job));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/jobs/:id
 */
adminRouter.patch('/jobs/:id', validateBody(jobUpdateSchema), async (req, res, next) => {
  try {
    const updated = await jobService.updateJob(req.params.id, req.body);
    res.json(sendSuccess(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/jobs/:id
 */
adminRouter.delete('/jobs/:id', async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(req.params.id);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});
