/**
 * Authentication Router
 */

import { Router } from 'express';
import { authService } from '../services/authService.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/authSchemas.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { sendSuccess } from '../utils/response.js';
import { config } from '../config/index.js';

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: config.sessionMaxAgeMs,
};

/**
 * POST /api/auth/register
 */
authRouter.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { user, token } = await authService.register(req.body);
      res.cookie('sid', token, cookieOptions);
      res.status(201).json(sendSuccess({ user, token }));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/login
 */
authRouter.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie('sid', token, cookieOptions);
      res.json(sendSuccess({ user, token }));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.sid || req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie('sid', { ...cookieOptions, maxAge: undefined });
    res.clearCookie('session_token', { ...cookieOptions, maxAge: undefined });
    res.json(sendSuccess({ message: 'Logged out successfully' }));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/session (or /me)
 */
authRouter.get('/session', async (req, res, next) => {
  try {
    const token = req.cookies?.sid || req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    const session = await authService.getSession(token || null);
    res.json(sendSuccess(session));
  } catch (err) {
    next(err);
  }
});
