import { z } from 'zod';
import { uuid } from '../../common/schemas.js';
export const createSchema = z.object({ title: z.string().trim().min(1).max(160).default('Nueva conversación'), cropId: uuid.optional() });
export const conversationIdSchema = z.object({ conversationId: uuid });
export const messageSchema = z.object({ content: z.string().trim().min(1).max(4_000) });
