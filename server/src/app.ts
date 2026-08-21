/**
 * Express Application Assembly
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';

import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { startupsRouter } from './routes/startups.js';
import { foundersRouter } from './routes/founders.js';
import { investorsRouter } from './routes/investors.js';
import { jobsRouter } from './routes/jobs.js';
import { areasRouter } from './routes/areas.js';
import { submissionsRouter } from './routes/submissions.js';
import { bookmarksRouter } from './routes/bookmarks.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';

import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimit.js';

export const app = express();

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // MapLibre tiles and external imagery allowed
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const buildAllowedOrigins = (): string[] => {
  const list: string[] = [];
  if (config.corsOrigin) {
    config.corsOrigin.split(',').forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) list.push(trimmed);
    });
  }
  if (!config.isProduction) {
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];
    devOrigins.forEach((d) => {
      if (!list.includes(d)) list.push(d);
    });
  }
  return list;
};

export const allowedOrigins = buildAllowedOrigins();

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

// 2. CORS (Strict explicit origin allowlist with credentials)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Cookie Parsing
app.use(cookieParser());

// 4. Request Body Parsing (Strict size limit)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Global Rate Limiter
app.use('/api', generalRateLimiter);

// 6. Mount Routers
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/startups', startupsRouter);
app.use('/api/founders', foundersRouter);
app.use('/api/investors', investorsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/areas', areasRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);

// 7. 404 Handler
app.use(notFoundHandler);

// 8. Global Error Handler
app.use(errorHandler);
