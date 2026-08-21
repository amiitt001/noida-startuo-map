/**
 * Bookmark Zod Schemas
 */

import { z } from 'zod';

export const bookmarkCreateSchema = z.object({
  type: z.enum(['startup', 'job', 'founder', 'investor']),
  itemId: z.string().min(1, 'Item ID is required'),
});

export const bookmarkParamSchema = z.object({
  id: z.string().min(1, 'Bookmark ID is required'),
});
