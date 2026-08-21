/**
 * Analytics Public Router
 */

import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { sendSuccess } from '../utils/response.js';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/ecosystem
 */
analyticsRouter.get('/ecosystem', async (_req, res, next) => {
  try {
    const stats = await analyticsService.getEcosystemStats();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.json(sendSuccess(stats));
  } catch (err) {
    next(err);
  }
});
