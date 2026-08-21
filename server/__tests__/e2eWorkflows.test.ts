/**
 * End-to-End User & Admin Workflow Integration Tests (Phase 6)
 *
 * Validates complete user journeys from submission to admin approval and publication.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Noida Startup Atlas — Phase 6 E2E Workflow & Security Tests', () => {
  let adminCookie: string;
  let userCookie: string;
  let submissionId: string;
  let createdStartupSlug: string;

  beforeAll(async () => {
    await prisma.$connect();

    // 1. Create & Login Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      email: `admin-e2e-${Date.now()}@noidaatlas.dev`,
      password: 'adminSecurePassword123!',
      name: 'E2E Admin User',
    });
    adminCookie = adminRes.get('Set-Cookie')?.[0] || '';

    // Upgrade user to admin role in database
    await prisma.user.update({
      where: { email: adminRes.body.data.user.email },
      data: { role: 'admin' },
    });

    // 2. Create Normal User
    const userRes = await request(app).post('/api/auth/register').send({
      email: `user-e2e-${Date.now()}@noidaatlas.dev`,
      password: 'userSecurePassword123!',
      name: 'E2E Normal User',
    });
    userCookie = userRes.get('Set-Cookie')?.[0] || '';
  });

  afterAll(async () => {
    if (createdStartupSlug) {
      await prisma.startup.delete({ where: { slug: createdStartupSlug } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('E2E Step 1: User submits a new startup application', async () => {
    const area = await prisma.area.findFirst();
    const companyName = `Quantum E2E ${Date.now()}`;

    const res = await request(app)
      .post('/api/submissions')
      .send({
        companyName,
        tagline: 'Next-gen Quantum Tech from Noida',
        website: `https://quantum-e2e-${Date.now()}.io`,
        foundedYear: 2024,
        type: 'Startup',
        stage: 'Seed',
        sector: 'DeepTech',
        areaId: area?.id || 'area-sec-62',
        areaName: 'Sector 62, Noida',
        address: 'Sector 62, Noida',
        founderName: 'Jane Quantum',
        founderRole: 'Founder & CEO',
        founderEmail: 'jane@quantum.io',
        founderLinkedin: 'https://linkedin.com/in/jane-quantum',
        employeeRange: '10-25',
        totalFunding: '$500K',
        description: 'Building deeptech quantum computers in Noida Sector 62.',
        techStack: 'Quantum Computing, Python, Qiskit',
        hiring: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    submissionId = res.body.data.id;
  });

  it('E2E Step 2: Admin reviews and approves pending submission (Atomic Transaction)', async () => {
    expect(submissionId).toBeDefined();

    const res = await request(app)
      .patch(`/api/admin/submissions/${submissionId}/status`)
      .set('Cookie', [adminCookie])
      .send({
        status: 'approved',
        notes: 'Approved via Phase 6 E2E Test Suite',
        latitude: 28.6139,
        longitude: 77.3910,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });

  it('E2E Step 3: Approved startup immediately appears in GeoJSON map API', async () => {
    const res = await request(app).get('/api/startups/geojson?sector=DeepTech');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const feature = res.body.data.features.find((f: any) =>
      f.properties.name.includes('Quantum E2E')
    );

    expect(feature).toBeDefined();
    expect(feature.geometry.coordinates[0]).toBeCloseTo(77.3910, 3);
    expect(feature.geometry.coordinates[1]).toBeCloseTo(28.6139, 3);
    createdStartupSlug = feature.properties.slug;
  });

  it('E2E Step 4: Normal user bookmarks the newly published startup', async () => {
    const startup = await prisma.startup.findUnique({ where: { slug: createdStartupSlug } });
    expect(startup).toBeDefined();

    const res = await request(app)
      .post('/api/bookmarks')
      .set('Cookie', [userCookie])
      .send({
        type: 'startup',
        itemId: startup!.id,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isNowSaved).toBe(true);
  });
});
