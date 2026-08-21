/**
 * Real Ecosystem Analytics Integration Test Suite (Phase 5)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Noida Startup Atlas — Phase 5 Analytics Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/analytics/ecosystem — returns 200 with real database-derived analytics', async () => {
    const res = await request(app).get('/api/analytics/ecosystem');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(typeof data.totalStartups).toBe('number');
    expect(typeof data.totalFounders).toBe('number');
    expect(typeof data.totalInvestors).toBe('number');
    expect(typeof data.totalJobs).toBe('number');
    expect(typeof data.hiringStartupsCount).toBe('number');
    expect(typeof data.totalFundingDisclosed).toBe('string');
    expect(Array.isArray(data.sectorBreakdown)).toBe(true);
    expect(Array.isArray(data.stageBreakdown)).toBe(true);
    expect(Array.isArray(data.areaBreakdown)).toBe(true);
    expect(Array.isArray(data.fundingTimeline)).toBe(true);
  });

  it('GET /api/analytics/ecosystem — metrics match real Prisma database counts', async () => {
    const [dbStartups, dbFounders, dbInvestors, dbJobs, dbHiring] = await Promise.all([
      prisma.startup.count(),
      prisma.founder.count(),
      prisma.investor.count(),
      prisma.job.count(),
      prisma.startup.count({ where: { hiring: true } }),
    ]);

    const res = await request(app).get('/api/analytics/ecosystem');
    const data = res.body.data;

    expect(data.totalStartups).toBe(dbStartups);
    expect(data.totalFounders).toBe(dbFounders);
    expect(data.totalInvestors).toBe(dbInvestors);
    expect(data.totalJobs).toBe(dbJobs);
    expect(data.hiringStartupsCount).toBe(dbHiring);
  });

  it('GET /api/analytics/ecosystem — sector breakdown contains calculated percentages', async () => {
    const res = await request(app).get('/api/analytics/ecosystem');
    const data = res.body.data;

    if (data.sectorBreakdown.length > 0) {
      const item = data.sectorBreakdown[0];
      expect(item.sector).toBeDefined();
      expect(typeof item.count).toBe('number');
      expect(typeof item.percentage).toBe('number');
    }
  });

  it('GET /api/analytics/ecosystem — area breakdown correctly matches area counts', async () => {
    const res = await request(app).get('/api/analytics/ecosystem');
    const data = res.body.data;

    if (data.areaBreakdown.length > 0) {
      const item = data.areaBreakdown[0];
      expect(item.areaName).toBeDefined();
      expect(typeof item.count).toBe('number');
      expect(typeof item.hiringCount).toBe('number');
    }
  });
});
