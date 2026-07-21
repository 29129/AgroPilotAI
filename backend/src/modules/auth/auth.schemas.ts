import { z } from 'zod';
export const registerSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(100), email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(8).max(72) }), params: z.any(), query: z.any() });
export const loginSchema = z.object({ body: z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(1) }), params: z.any(), query: z.any() });
export const tokenSchema = z.object({ body: z.object({ refreshToken: z.string().min(1) }), params: z.any(), query: z.any() });
