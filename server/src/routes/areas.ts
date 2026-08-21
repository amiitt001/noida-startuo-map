/**
 * Area Public Router
 */

import { Router } from 'express';
import { areaService } from '../services/areaService.js';
import { sendSuccess } from '../utils/response.js';

export const areasRouter = Router();

/**
 * GET /api/areas
 */
areasRouter.get('/', async (_req, res, next) => {
  try {
    const areas = await areaService.getAllAreas();
    res.json(sendSuccess(areas));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/areas/:slug
 */
areasRouter.get('/:slug', async (req, res, next) => {
  try {
    const area = await areaService.getAreaBySlug(req.params.slug);
    res.json(sendSuccess(area));
  } catch (err) {
    next(err);
  }
});
