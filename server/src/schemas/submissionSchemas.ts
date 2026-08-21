/**
 * Submission Zod Schemas
 */

import { z } from 'zod';

// Public submission request payload
export const submissionCreateSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  website: z.string().url('Website must be a valid URL'),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  type: z.enum(['Startup', 'Scale-up', 'Unicorn', 'Bootstrapped', 'Public']),
  stage: z.enum(['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth']),
  sector: z.string().min(2, 'Sector is required'),
  areaId: z.string().min(1, 'Area is required'),
  areaName: z.string().min(2, 'Area name is required'),
  address: z.string().min(5, 'Address is required'),
  founderName: z.string().min(2, 'Founder name is required'),
  founderRole: z.string().min(2, 'Founder role is required'),
  founderEmail: z.string().email('Valid founder email is required'),
  founderLinkedin: z.string().url('LinkedIn URL must be valid'),
  employeeRange: z.string().min(1, 'Employee range is required'),
  totalFunding: z.string().min(1, 'Total funding is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  techStack: z.string().min(2, 'Tech stack is required'),
  hiring: z.boolean().optional().default(false),
  // Coordinates are optional on public submission, but if provided must be valid numbers
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Admin status change schema
export const submissionStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'approved', 'rejected']),
  notes: z.string().optional(),
  // If approving, coordinates must be provided if not already in submission
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
