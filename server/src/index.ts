/**
 * Server Entry Point
 */

import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { prisma } from './db.js';

const server = app.listen(config.port, () => {
  logger.info(`🚀 Noida Startup Atlas API Server running on port ${config.port} (${config.env})`);
  logger.info(`📍 Health check: http://localhost:${config.port}/api/health`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
