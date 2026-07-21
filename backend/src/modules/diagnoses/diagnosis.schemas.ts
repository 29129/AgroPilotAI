import { z } from 'zod';
import { uuid } from '../../common/schemas.js';

export const cropIdSchema = z.object({ cropId: uuid });
export const diagnosisInputSchema = z.object({ symptoms: z.string().trim().max(1_000).optional() });
export const diagnosisIdSchema = z.object({ diagnosisId: uuid });
