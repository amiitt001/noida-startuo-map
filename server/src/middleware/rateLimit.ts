/**
 * Rate Limiting Middleware
 */

import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Strict rate limiter for authentication endpoints (login, register).
 * Limit: 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security({
      event: 'RATE_LIMIT_EXCEEDED_AUTH',
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json(sendError('RATE_LIMITED', 'Too many login attempts, please try again in 15 minutes.'));
  },
});

/**
 * Rate limiter for public submission creations to prevent spam.
 * Limit: 5 submissions per hour per IP.
 */
export const submissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security({
      event: 'RATE_LIMIT_EXCEEDED_SUBMISSION',
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json(sendError('RATE_LIMITED', 'Submission limit reached, please try again later.'));
  },
});

/**
 * Moderate rate limiter for user mutation endpoints (bookmarks).
 * Limit: 60 requests per 15 minutes.
 */
export const mutationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security({
      event: 'RATE_LIMIT_EXCEEDED_MUTATION',
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json(sendError('RATE_LIMITED', 'Too many requests, please slow down.'));
  },
});

/**
 * Generous general API rate limiter.
 * Limit: 300 requests per 15 minutes.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(sendError('RATE_LIMITED', 'Rate limit exceeded, please try again later.'));
  },
});
