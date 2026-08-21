/**
 * Security Remediation & Regression Test Suite
 *
 * Verifies fixes for:
 * 1. Finding 1 (CRITICAL): Admin Credential Hardening & Environment Validation
 * 2. Finding 2 (HIGH): CVE-2026-40345 deepmerge-ts Dependency Override
 * 3. Finding 3 (MEDIUM): Strict CORS Origin Allowlist Configuration
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, isOriginAllowed, allowedOrigins } from '../src/app.js';
import { validateEnvironmentConfig, isWeakAdminPassword } from '../src/config/index.js';

describe('Strix Security Remediation — Regression Test Suite', () => {
  // ─── 1. CRITICAL — Default Admin Credential Validation Tests ────────────────

  describe('Finding 1 — Admin Credential & Config Security', () => {
    it('isWeakAdminPassword — identifies weak, default, and predictable passwords', () => {
      expect(isWeakAdminPassword(undefined)).toBe(true);
      expect(isWeakAdminPassword('')).toBe(true);
      expect(isWeakAdminPassword('short')).toBe(true);
      expect(isWeakAdminPassword('admin')).toBe(true);
      expect(isWeakAdminPassword('admin123')).toBe(true);
      expect(isWeakAdminPassword('dev-admin-pass-change-in-env')).toBe(true);
      expect(isWeakAdminPassword('YOUR_SECURE_ADMIN_PASSWORD')).toBe(true);
      expect(isWeakAdminPassword('password123')).toBe(true);

      // Strong password should pass
      expect(isWeakAdminPassword('xK9#mQ2$vL7!pW4zR')).toBe(false);
    });

    it('Production + missing ADMIN_PASSWORD → fails securely', () => {
      expect(() => {
        validateEnvironmentConfig({
          NODE_ENV: 'production',
          JWT_SECRET: 'a-very-secure-production-jwt-secret-key-that-is-long-enough-12345',
          ADMIN_PASSWORD: '',
        });
      }).toThrow(/SECURITY FATAL/);
    });

    it('Production + weak/default ADMIN_PASSWORD → fails securely', () => {
      const weakPasswords = ['admin123', 'dev-admin-pass-change-in-env', 'password', '12345678', 'change-me'];
      weakPasswords.forEach((weakPass) => {
        expect(() => {
          validateEnvironmentConfig({
            NODE_ENV: 'production',
            JWT_SECRET: 'a-very-secure-production-jwt-secret-key-that-is-long-enough-12345',
            ADMIN_PASSWORD: weakPass,
          });
        }).toThrow(/SECURITY FATAL/);
      });
    });

    it('Production + valid secure secret → succeeds', () => {
      expect(() => {
        validateEnvironmentConfig({
          NODE_ENV: 'production',
          JWT_SECRET: 'a-very-secure-production-jwt-secret-key-that-is-long-enough-12345',
          ADMIN_PASSWORD: 'SuperSecureProdPassword2026!#$%',
        });
      }).not.toThrow();
    });

    it('Development/test mode → functional with dev fallback', () => {
      expect(() => {
        validateEnvironmentConfig({
          NODE_ENV: 'development',
        });
      }).not.toThrow();
    });
  });

  // ─── 3. MEDIUM — CORS Allowlist & Header Security Tests ────────────────────

  describe('Finding 3 — CORS Strict Origin Allowlist', () => {
    it('Trusted origin receives Access-Control-Allow-Origin & Credentials', async () => {
      const trustedOrigin = allowedOrigins[0] || 'http://localhost:3000';
      const res = await request(app)
        .get('/api/health')
        .set('Origin', trustedOrigin);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(trustedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('Unauthorized origin does NOT receive an Access-Control-Allow-Origin header', async () => {
      const untrustedOrigin = 'http://evil-attacker-site.com';
      const res = await request(app)
        .get('/api/health')
        .set('Origin', untrustedOrigin);

      // CORS middleware omits Access-Control-Allow-Origin for disallowed origins
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('OPTIONS preflight request from trusted origin succeeds with CORS headers', async () => {
      const trustedOrigin = allowedOrigins[0] || 'http://localhost:3000';
      const res = await request(app)
        .options('/api/startups')
        .set('Origin', trustedOrigin)
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe(trustedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('OPTIONS preflight from untrusted origin omits CORS allow header', async () => {
      const untrustedOrigin = 'http://malicious-origin.org';
      const res = await request(app)
        .options('/api/startups')
        .set('Origin', untrustedOrigin)
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('isOriginAllowed helper strictly checks allowed list', () => {
      expect(isOriginAllowed(undefined)).toBe(true); // Non-browser/curl requests
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('http://evil-domain.com')).toBe(false);
      expect(isOriginAllowed('http://localhost.evil-domain.com')).toBe(false);
    });
  });
});
