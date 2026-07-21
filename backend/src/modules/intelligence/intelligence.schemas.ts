import { z } from 'zod';
import { uuid } from '../../common/schemas.js';
export const cropIdSchema = z.object({ cropId: uuid });
export const recommendationIdSchema = z.object({ recommendationId: uuid });
export const planIdSchema = z.object({ planId: uuid });
export const analysisSchema = z.object({ analysisType: z.enum(['FULL', 'QUICK']).default('FULL'), include: z.array(z.enum(['CLIMATE', 'HEALTH', 'IRRIGATION', 'MARKET'])).min(1).optional(), userContext: z.object({ currentConcern: z.string().trim().max(1_000).optional() }).optional() });
export const marketSchema = z.object({ product: z.string().trim().min(2).max(100), province: z.string().trim().min(2).max(100) });
