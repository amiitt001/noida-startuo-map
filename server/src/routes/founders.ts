/**
 * Founder Public Router
 */

import { Router } from 'express';
import { founderService } from '../services/founderService.js';
import { validateQuery } from '../middleware/validate.js';
import { founderQuerySchema } from '../schemas/founderSchemas.js';
import { sendSuccess } from '../utils/response.js';

export const foundersRouter = Router();

/**
 * GET /api/founders
 */
foundersRouter.get('/', validateQuery(founderQuerySchema), async (req, res, next) => {
  try {
    const filters = req.query as any;
    const founders = await founderService.getAllFounders(filters);
    res.json(sendSuccess(founders));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/founders/:slug
 */
foundersRouter.get('/:slug', async (req, res, next) => {
  try {
    const founder = await founderService.getFounderBySlug(req.params.slug);
    res.json(sendSuccess(founder));
  } catch (err) {
    next(err);
  }
});
