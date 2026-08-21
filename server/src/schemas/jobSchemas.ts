/**
 * Job Zod Schemas
 */

import { z } from 'zod';
import { paginationSchema } from './querySchemas.js';

export const jobQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  startup: z.string().optional(),
  workMode: z.string().optional(),
  isFresher: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  isInternship: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  area: z.string().optional(),
});

export const jobCreateSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  startupId: z.string().min(1, 'Startup ID is required'),
  location: z.string().min(2, 'Location is required'),
  areaName: z.string().min(2, 'Area name is required'),
  workMode: z.enum(['Remote', 'On-site', 'Hybrid']),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  experience: z.string().min(1, 'Experience is required'),
  salaryRange: z.string().min(1, 'Salary range is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement required'),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
  postedDate: z.string().optional().default('Just now'),
  isFresherFriendly: z.boolean().optional().default(false),
  isInternship: z.boolean().optional().default(false),
  applyUrl: z.string().url('Apply URL must be valid').optional().nullable(),
  contactEmail: z.string().email('Valid contact email is required'),
});

export const jobUpdateSchema = jobCreateSchema.partial();
