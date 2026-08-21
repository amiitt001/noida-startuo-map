/**
 * Express API Integration & Security Test Suite
 *
 * Tests the real Express app against PostgreSQL via Prisma.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Noida Startup Atlas — Phase 2 Integration Tests', () => {
  let userCookie: string;
  let adminCookie: string;
  let userId: string;
  let adminId: string;
  let createdStartupId: string;
  let submissionId: string;

  beforeAll(async () => {
    // Ensure DB connection
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test users and data created during tests
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    if (adminId) {
      await prisma.user.delete({ where: { id: adminId } }).catch(() => {});
    }
    if (createdStartupId) {
      await prisma.startup.delete({ where: { id: createdStartupId } }).catch(() => {});
    }
    if (submissionId) {
      await prisma.submission.delete({ where: { id: submissionId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // ─── 1. Public Endpoints ───────────────────────────────────────────────────

  describe('Public API Endpoints', () => {
    it('GET /api/health — returns status ok without leaking internal config', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.data.databaseUrl).toBeUndefined();
    });

    it('GET /api/startups — returns paginated startup list', async () => {
      const res = await request(app).get('/api/startups?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });

    it('GET /api/startups?limit=999999 — enforces pagination max limit bound (<= 100)', async () => {
      const res = await request(app).get('/api/startups?limit=999999');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/startups/:slug — returns startup details for valid slug', async () => {
      const res = await request(app).get('/api/startups/acme-ai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('acme-ai');
      expect(res.body.data.name).toBe('Acme AI');
    });

    it('GET /api/founders — returns founders list', async () => {
      const res = await request(app).get('/api/founders');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/investors — returns investors list', async () => {
      const res = await request(app).get('/api/investors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/jobs — returns jobs list', async () => {
      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/areas — returns areas with counts', async () => {
      const res = await request(app).get('/api/areas');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].startupCount).toBeDefined();
    });

    it('GET /api/analytics/ecosystem — returns real database aggregations', async () => {
      const res = await request(app).get('/api/analytics/ecosystem');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.totalStartups).toBe('number');
      expect(typeof res.body.data.totalFounders).toBe('number');
      expect(res.body.data.sectorBreakdown).toBeDefined();
    });
  });

  // ─── 2. Authentication & Sessions ──────────────────────────────────────────

  describe('Authentication & Sessions', () => {
    const testUserEmail = `user_${Date.now()}@example.com`;
    const testAdminEmail = `admin_${Date.now()}@example.com`;
    const password = 'securePassword123';

    it('POST /api/auth/register — registers a new normal user and sets HTTP-only cookie', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: testUserEmail,
        password,
        name: 'Regular Test User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
      expect(res.body.data.user.role).toBe('user');
      userId = res.body.data.user.id;

      // Verify Set-Cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      userCookie = cookies.find((c: string) => c.startsWith('sid=')) || '';
      expect(userCookie).toContain('HttpOnly');
    });

    it('GET /api/auth/session — returns authenticated session details when cookie provided', async () => {
      const res = await request(app).get('/api/auth/session').set('Cookie', [userCookie]);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.authenticated).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
      expect(res.body.data.user.role).toBe('user');
    });

    it('POST /api/auth/login — authenticates admin user and returns admin role', async () => {
      // Create admin user directly in DB first
      const passwordHash = await import('bcryptjs').then((b) => b.hash(password, 10));
      const adminRecord = await prisma.user.create({
        data: {
          email: testAdminEmail,
          passwordHash,
          name: 'Test Admin User',
          role: 'admin',
        },
      });
      adminId = adminRecord.id;

      const res = await request(app).post('/api/auth/login').send({
        email: testAdminEmail,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');

      const cookies = res.headers['set-cookie'];
      adminCookie = cookies.find((c: string) => c.startsWith('sid=')) || '';
    });

    it('POST /api/auth/logout — clears cookie and invalidates session in DB', async () => {
      const res = await request(app).post('/api/auth/logout').set('Cookie', [userCookie]);
      expect(res.status).toBe(200);

      // Verify session is no longer authenticated
      const checkRes = await request(app).get('/api/auth/session').set('Cookie', [userCookie]);
      expect(checkRes.body.data.authenticated).toBe(false);
    });
  });

  // ─── 3. Critical Security & RBAC Test ──────────────────────────────────────

  describe('Critical RBAC Security Test', () => {
    const payload = {
      name: 'RBAC Test Startup',
      tagline: 'Enterprise AI testing suite',
      description: 'Testing RBAC authorization rules',
      logo: 'https://example.com/logo.png',
      website: 'https://rbactest.example.com',
      foundedYear: 2024,
      type: 'Startup',
      stage: 'Seed',
      areaId: 'area-sec-62',
      address: 'Sector 62 Noida',
      latitude: 28.628,
      longitude: 77.365,
      employeeRange: '10-20',
      totalFunding: '$1M',
      techStack: ['TypeScript', 'Express'],
      linkedin: 'https://linkedin.com/company/rbactest',
      sectors: ['SaaS'],
    };

    it('Anonymous POST /api/admin/startups — fails with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/admin/startups').send(payload);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Normal USER POST /api/admin/startups — fails with 403 Forbidden', async () => {
      // Re-login as normal user to get fresh cookie
      const loginRes = await request(app).post('/api/auth/login').send({
        email: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
        password: 'securePassword123',
      });
      const cookie = loginRes.headers['set-cookie'].find((c: string) => c.startsWith('sid='));

      const res = await request(app)
        .post('/api/admin/startups')
        .set('Cookie', [cookie])
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('ADMIN POST /api/admin/startups — succeeds with 201 Created', async () => {
      const res = await request(app)
        .post('/api/admin/startups')
        .set('Cookie', [adminCookie])
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('RBAC Test Startup');
      createdStartupId = res.body.data.id;
    });
  });

  // ─── 4. Submissions API & Approval Workflow ─────────────────────────────────

  describe('Submissions API & Approval Workflow', () => {
    it('POST /api/submissions — accepts public submission and forces PENDING status', async () => {
      const payload = {
        companyName: `Sub Test Co ${Date.now()}`,
        tagline: 'Smart energy grid telemetry platform',
        website: `https://subtest_${Date.now()}.example.com`,
        foundedYear: 2024,
        type: 'Startup',
        stage: 'Pre-seed',
        sector: 'ClimateTech',
        areaId: 'area-sec-62',
        areaName: 'Sector 62, Noida',
        address: 'Sector 62 Noida',
        founderName: 'Rohan Gupta',
        founderRole: 'Founder & CEO',
        founderEmail: 'rohan@subtest.example.com',
        founderLinkedin: 'https://linkedin.com/in/rohanguptaclean',
        employeeRange: '5-10',
        totalFunding: '$500K',
        description: 'Decentralized energy distribution monitoring for solar microgrids.',
        techStack: 'Python, Rust, IoT',
        hiring: true,
        // Client attempts to inject privileged status=approved
        status: 'approved',
      };

      const res = await request(app).post('/api/submissions').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending'); // Server MUST force pending
      submissionId = res.body.data.id;
    });

    it('PATCH /api/admin/submissions/:id/status — Admin approves submission and creates Startup', async () => {
      const res = await request(app)
        .patch(`/api/admin/submissions/${submissionId}/status`)
        .set('Cookie', [adminCookie])
        .send({
          status: 'approved',
          latitude: 28.6285,
          longitude: 77.365,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');

      // Verify the startup was published to the DB
      const sub = await prisma.submission.findUnique({ where: { id: submissionId } });
      const startup = await prisma.startup.findFirst({ where: { name: sub?.companyName } });
      expect(startup).toBeDefined();
      expect(startup?.verified).toBe(true);
      if (startup) {
        await prisma.startup.delete({ where: { id: startup.id } }).catch(() => {});
      }
    });
  });

  // ─── 5. Bookmarks & IDOR Protection ────────────────────────────────────────

  describe('Bookmarks & IDOR Security', () => {
    let bookmarkId: string;
    let secondUserCookie: string;
    let secondUserId: string;

    beforeAll(async () => {
      // Register second user for IDOR testing
      const res = await request(app).post('/api/auth/register').send({
        email: `user2_${Date.now()}@example.com`,
        password: 'securePassword123',
        name: 'Second Test User',
      });
      secondUserId = res.body.data.user.id;
      secondUserCookie = res.headers['set-cookie'].find((c: string) => c.startsWith('sid='));
    });

    afterAll(async () => {
      if (secondUserId) {
        await prisma.user.delete({ where: { id: secondUserId } }).catch(() => {});
      }
    });

    it('POST /api/bookmarks — User A creates a bookmark', async () => {
      // User A logs in
      const loginRes = await request(app).post('/api/auth/login').send({
        email: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
        password: 'securePassword123',
      });
      const cookie = loginRes.headers['set-cookie'].find((c: string) => c.startsWith('sid='));

      const res = await request(app)
        .post('/api/bookmarks')
        .set('Cookie', [cookie])
        .send({ type: 'startup', itemId: 'st-acme-ai' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const bookmarksRes = await request(app).get('/api/bookmarks').set('Cookie', [cookie]);
      expect(bookmarksRes.body.data.length).toBeGreaterThan(0);
      bookmarkId = bookmarksRes.body.data[0].id;
    });

    it('DELETE /api/bookmarks/:id — User B attempts to delete User A bookmark (IDOR test) -> fails with 403 Forbidden', async () => {
      const res = await request(app)
        .delete(`/api/bookmarks/${bookmarkId}`)
        .set('Cookie', [secondUserCookie]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
