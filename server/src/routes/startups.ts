/**
 * Startup Public Router
 */

import { Router } from 'express';
import { startupService } from '../services/startupService.js';
import { validateQuery } from '../middleware/validate.js';
import { startupQuerySchema, geoJsonQuerySchema } from '../schemas/startupSchemas.js';
import { sendSuccess } from '../utils/response.js';

export const startupsRouter = Router();

/**
 * GET /api/startups/geojson
 */
startupsRouter.get('/geojson', validateQuery(geoJsonQuerySchema), async (req, res, next) => {
  try {
    const filters = req.query as any;
    const geojsonData = await startupService.getGeoJSON({
      search: filters.search,
      sector: filters.sector,
      stage: filters.stage,
      type: filters.type,
      area: filters.area,
      hiringOnly: filters.hiring,
      verifiedOnly: filters.verified,
      bbox: filters.bbox,
    });

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
    res.json(sendSuccess(geojsonData));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/startups
 */
startupsRouter.get('/', validateQuery(startupQuerySchema), async (req, res, next) => {
  try {
    const { page = 1, limit = 24, ...filters } = req.query as any;
    const result = await startupService.getAllStartups(filters, page, limit);

    res.json(
      sendSuccess(result.startups, {
        page,
        limit,
        total: result.totalCount,
        totalPages: result.totalPages,
      })
    );
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/startups/:slug/similar
 */
startupsRouter.get('/:slug/similar', async (req, res, next) => {
  try {
    const similar = await startupService.getSimilarStartups(req.params.slug);
    res.json(sendSuccess(similar));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/startups/:slug
 */
startupsRouter.get('/:slug', async (req, res, next) => {
  try {
    const startup = await startupService.getStartupBySlug(req.params.slug);
    res.json(sendSuccess(startup));
  } catch (err) {
    next(err);
  }
});
