/**
 * Server Configuration
 *
 * Centralized environment variable loader and security validation.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const WEAK_ADMIN_PASSWORDS = [
  'admin',
  'admin123',
  'admin1234',
  'password',
  'password123',
  '123456',
  '12345678',
];

export function isWeakAdminPassword(pwd: string | undefined): boolean {
  if (!pwd || pwd.trim().length < 10) return true;
  const lower = pwd.toLowerCase().trim();
  if (WEAK_ADMIN_PASSWORDS.includes(lower)) return true;
  if (
    lower.includes('dev-admin-pass') ||
    lower.includes('change-me') ||
    lower.includes('change-in-env') ||
    lower.includes('placeholder') ||
    lower.includes('your_secure')
  ) {
    return true;
  }
  return false;
}

export function validateEnvironmentConfig(envVars: Record<string, string | undefined> = process.env): void {
  const isProd = envVars.NODE_ENV === 'production';
  const jwtSec = envVars.JWT_SECRET;
  const adminPass = envVars.ADMIN_PASSWORD;

  if (isProd) {
    if (!jwtSec || jwtSec.includes('change-me') || jwtSec.includes('YOUR_SECURE') || jwtSec.length < 32) {
      throw new Error('SECURITY FATAL: A secure, non-default JWT_SECRET environment variable (min 32 chars) must be set in production!');
    }
    if (!adminPass || isWeakAdminPassword(adminPass)) {
      throw new Error('SECURITY FATAL: A secure, non-default ADMIN_PASSWORD environment variable (min 10 chars) must be set in production!');
    }
  }
}

// Perform environment validation
validateEnvironmentConfig(process.env);

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  isTest,
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-key-do-not-use-in-production-12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  sessionMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@noidaatlas.dev',
  adminPassword: isProduction ? process.env.ADMIN_PASSWORD! : (process.env.ADMIN_PASSWORD || 'dev-admin-pass-change-in-env'),
};
