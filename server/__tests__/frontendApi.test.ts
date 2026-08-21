import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { saveService } from '../../src/services/saveService.js';

describe('Frontend API Client & Service Contract Verification', () => {
  it('Supertest GET /api/health — returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('Supertest GET /api/startups — returns startups list with pagination', async () => {
    const res = await request(app).get('/api/startups?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('saveService — reads fallback bookmarks when unauthenticated', async () => {
    const bookmarks = await saveService.getBookmarks(false);
    expect(Array.isArray(bookmarks)).toBe(true);
  });
});
