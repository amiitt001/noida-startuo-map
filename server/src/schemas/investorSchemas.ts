/**
 * Investor Zod Schemas
 */

import { z } from 'zod';
import { paginationSchema } from './querySchemas.js';

export const investorQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  type: z.string().optional(),
  stage: z.string().optional(),
});

export const investorCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  logo: z.string().url('Logo must be a valid URL'),
  type: z.enum(['Venture Capital', 'Angel Syndicate', 'Micro VC', 'Family Office', 'Corporate VC']),
  stages: z.array(z.string()).min(1, 'At least one stage required'),
  focusSectors: z.array(z.string()).min(1, 'At least one focus sector required'),
  location: z.string().min(2, 'Location is required'),
  checkSize: z.string().min(1, 'Check size is required'),
  website: z.string().url('Website must be a valid URL'),
  linkedin: z.string().url('LinkedIn URL must be valid'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalInvestments: z.number().int().min(0).optional().default(0),
});

export const investorUpdateSchema = investorCreateSchema.partial();
