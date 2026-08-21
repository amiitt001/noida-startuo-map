/**
 * Pagination & Common Query Schemas
 */

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Page must be a positive integer greater than or equal to 1',
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 24))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});
