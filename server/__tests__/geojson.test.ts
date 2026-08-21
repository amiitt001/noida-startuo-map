/**
 * GeoJSON API Integration & Security Test Suite (Phase 4)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Noida Startup Atlas — Phase 4 GeoJSON Endpoint Tests', () => {
  let createdStartupId: string;

  beforeAll(async () => {
    await prisma.$connect();
    // Create a known test startup with valid coordinates to verify GeoJSON structure
    const area = await prisma.area.findFirst();
    if (area) {
      const startup = await prisma.startup.create({
        data: {
          name: 'GeoTest AI Startup',
          slug: 'geotest-ai-startup',
          tagline: 'Building GeoJSON solutions',
          description: 'A test startup for validating GeoJSON API endpoints.',
          logo: 'https://example.com/logo.png',
          website: 'https://example.com',
          foundedYear: 2024,
          type: 'Startup',
          stage: 'Seed',
          areaId: area.id,
          address: 'Sector 62, Noida',
          latitude: 28.6139,
          longitude: 77.3910,
          employeeRange: '10-50',
          totalFunding: '$1M',
          techStack: ['Node.js', 'React', 'MapLibre'],
          linkedin: 'https://linkedin.com/company/geotest',
          verified: true,
          hiring: true,
          sectors: ['AI / ML', 'SaaS'],
        },
      });
      createdStartupId = startup.id;
    }
  });

  afterAll(async () => {
    if (createdStartupId) {
      await prisma.startup.delete({ where: { id: createdStartupId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('GET /api/startups/geojson — returns FeatureCollection', async () => {
    const res = await request(app).get('/api/startups/geojson');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('FeatureCollection');
    expect(Array.isArray(res.body.data.features)).toBe(true);
  });

  it('GET /api/startups/geojson — coordinates order is strictly [longitude, latitude]', async () => {
    const res = await request(app).get('/api/startups/geojson?search=GeoTest');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.features.length).toBeGreaterThan(0);

    const feature = res.body.data.features.find((f: any) => f.properties.slug === 'geotest-ai-startup');
    expect(feature).toBeDefined();
    expect(feature.geometry.type).toBe('Point');
    // Longitude = 77.3910, Latitude = 28.6139
    expect(feature.geometry.coordinates[0]).toBeCloseTo(77.3910, 3);
    expect(feature.geometry.coordinates[1]).toBeCloseTo(28.6139, 3);
  });

  it('GET /api/startups/geojson — includes required properties without leaking private fields', async () => {
    const res = await request(app).get('/api/startups/geojson?search=GeoTest');
    expect(res.status).toBe(200);
    const feature = res.body.data.features.find((f: any) => f.properties.slug === 'geotest-ai-startup');
    expect(feature).toBeDefined();

    const props = feature.properties;
    expect(props.id).toBeDefined();
    expect(props.slug).toBe('geotest-ai-startup');
    expect(props.name).toBe('GeoTest AI Startup');
    expect(props.sector).toBe('AI / ML');
    expect(props.stage).toBe('Seed');
    expect(props.type).toBe('Startup');
    expect(props.hiring).toBe(true);
    expect(props.verified).toBe(true);
    expect(props.logo).toBe('https://example.com/logo.png');

    // Security check: ensure sensitive/unneeded database fields are not present
    expect(props.passwordHash).toBeUndefined();
    expect(props.adminNotes).toBeUndefined();
    expect(props.userRole).toBeUndefined();
  });

  it('GET /api/startups/geojson — server-side filtering works (sector, hiring, verified)', async () => {
    const resHiring = await request(app).get('/api/startups/geojson?hiring=true&sector=AI%20%2F%20ML');
    expect(resHiring.status).toBe(200);
    expect(resHiring.body.success).toBe(true);
    expect(resHiring.body.data.features.every((f: any) => f.properties.hiring === true)).toBe(true);
  });

  it('GET /api/startups/geojson — bounding box (bbox) filtering works', async () => {
    // Valid bbox around Noida [minLng, minLat, maxLng, maxLat]
    const validBbox = '77.0,28.0,78.0,29.0';
    const res = await request(app).get(`/api/startups/geojson?bbox=${validBbox}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.features.length).toBeGreaterThan(0);

    // Bbox far away (e.g. London coordinates) -> should return 0 features
    const awayBbox = '-0.5,51.3,0.3,51.7';
    const resAway = await request(app).get(`/api/startups/geojson?bbox=${awayBbox}`);
    expect(resAway.status).toBe(200);
    expect(resAway.body.data.features.length).toBe(0);
  });

  it('GET /api/startups/geojson — rejects malformed bbox with 400 Validation Error', async () => {
    const resInvalid = await request(app).get('/api/startups/geojson?bbox=invalid,bbox');
    expect(resInvalid.status).toBe(400);
    expect(resInvalid.body.success).toBe(false);
    expect(resInvalid.body.error.code).toBe('VALIDATION_ERROR');

    const resInverted = await request(app).get('/api/startups/geojson?bbox=78.0,29.0,77.0,28.0');
    expect(resInverted.status).toBe(400);
    expect(resInverted.body.success).toBe(false);
  });
});
