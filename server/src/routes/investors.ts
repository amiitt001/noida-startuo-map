/**
 * Investor Public Router
 */

import { Router } from 'express';
import { investorService } from '../services/investorService.js';
import { validateQuery } from '../middleware/validate.js';
import { investorQuerySchema } from '../schemas/investorSchemas.js';
import { sendSuccess } from '../utils/response.js';

export const investorsRouter = Router();

/**
 * GET /api/investors
 */
investorsRouter.get('/', validateQuery(investorQuerySchema), async (req, res, next) => {
  try {
    const { search, type, stage } = req.query as any;
    const investors = await investorService.getAllInvestors(search, type, stage);
    res.json(sendSuccess(investors));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/investors/:slug
 */
investorsRouter.get('/:slug', async (req, res, next) => {
  try {
    const investor = await investorService.getInvestorBySlug(req.params.slug);
    res.json(sendSuccess(investor));
  } catch (err) {
    next(err);
  }
});
