/**
 * Startup Zod Schemas
 */

import { z } from 'zod';
import { paginationSchema } from './querySchemas.js';

export const startupQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  type: z.string().optional(),
  area: z.string().optional(),
  hiring: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  verified: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  sortBy: z.enum(['recent', 'funded', 'hiring', 'alphabetical', 'relevance']).optional(),
});

export const geoJsonQuerySchema = z.object({
  search: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  type: z.string().optional(),
  area: z.string().optional(),
  hiring: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  verified: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  bbox: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const parts = val.split(',').map((p) => p.trim());
      if (parts.length !== 4) return false;
      const [minLng, minLat, maxLng, maxLat] = parts.map(Number);
      if (
        [minLng, minLat, maxLng, maxLat].some(
          (num) => Number.isNaN(num) || num === null
        )
      ) {
        return false;
      }
      if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
        return false;
      }
      if (minLng > maxLng || minLat > maxLat) {
        return false;
      }
      return true;
    }, 'Invalid bbox parameter. Format must be minLng,minLat,maxLng,maxLat with valid coordinate bounds.'),
});

export const startupCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  longDescription: z.string().optional(),
  logo: z.string().url('Logo must be a valid URL'),
  website: z.string().url('Website must be a valid URL'),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  type: z.enum(['Startup', 'Scale-up', 'Unicorn', 'Bootstrapped', 'Public']),
  stage: z.enum(['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth']),
  areaId: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90, 'Valid latitude required'),
  longitude: z.number().min(-180).max(180, 'Valid longitude required'),
  employeeRange: z.string().min(1, 'Employee range is required'),
  totalFunding: z.string().min(1, 'Total funding is required'),
  techStack: z.array(z.string()).min(1, 'At least one tech stack item required'),
  linkedin: z.string().url('LinkedIn URL must be valid'),
  twitter: z.string().url('Twitter URL must be valid').optional().nullable(),
  github: z.string().url('GitHub URL must be valid').optional().nullable(),
  verified: z.boolean().optional().default(false),
  hiring: z.boolean().optional().default(false),
  sectors: z.array(z.string()).min(1, 'At least one sector required'),
});

export const startupUpdateSchema = startupCreateSchema.partial();
