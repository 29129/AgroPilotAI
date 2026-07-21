import { z } from 'zod';
export const uuid = z.string().uuid();
export const idParams = (key: string) => z.object({ body: z.any().optional(), query: z.any().optional(), params: z.object({ [key]: uuid }) });
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export const isoDate = z.string().datetime({ offset: true }).or(z.string().date());
