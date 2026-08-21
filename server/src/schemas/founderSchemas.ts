/**
 * Founder Zod Schemas
 */

import { z } from 'zod';
import { paginationSchema } from './querySchemas.js';

export const founderQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sector: z.string().optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
});

export const founderCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  photo: z.string().url('Photo must be a valid URL'),
  coverImage: z.string().url('Cover image must be a valid URL').optional().nullable(),
  role: z.string().min(2, 'Role is required'),
  startupId: z.string().min(1, 'Startup ID is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  linkedin: z.string().url('LinkedIn URL must be valid'),
  twitter: z.string().url('Twitter URL must be valid').optional().nullable(),
  github: z.string().url('GitHub URL must be valid').optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  sectors: z.array(z.string()).min(1, 'At least one sector required'),
  stage: z.enum(['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth']),
  location: z.string().min(2, 'Location is required'),
  areaId: z.string().min(1, 'Area ID is required'),
  previousCompanies: z.array(z.string()).optional(),
  education: z.string().optional().nullable(),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
  verified: z.boolean().optional().default(false),
});

export const founderUpdateSchema = founderCreateSchema.partial();
