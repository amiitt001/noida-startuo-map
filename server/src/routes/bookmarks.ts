/**
 * Bookmarks Router
 *
 * All operations require authentication and enforce strict user isolation (IDOR protection).
 */

import { Router } from 'express';
import { bookmarkService } from '../services/bookmarkService.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { bookmarkCreateSchema } from '../schemas/bookmarkSchemas.js';
import { mutationRateLimiter } from '../middleware/rateLimit.js';
import { sendSuccess } from '../utils/response.js';

export const bookmarksRouter = Router();

// Protect all bookmark endpoints
bookmarksRouter.use(requireAuth);

/**
 * GET /api/bookmarks
 */
bookmarksRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const bookmarks = await bookmarkService.getBookmarks(userId);
    res.json(sendSuccess(bookmarks));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookmarks
 */
bookmarksRouter.post('/', mutationRateLimiter, validateBody(bookmarkCreateSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { type, itemId } = req.body;
    const result = await bookmarkService.toggleBookmark(userId, type, itemId);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/bookmarks/:id
 */
bookmarksRouter.delete('/:id', mutationRateLimiter, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const bookmarkId = req.params.id;
    const result = await bookmarkService.deleteBookmark(userId, bookmarkId);
    res.json(sendSuccess(result));
  } catch (err) {
    next(err);
  }
});
