import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().positive().default(7),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000'),
  PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  UPLOAD_DIR: z.string().default('uploads'),
  WEATHER_API_URL: z.string().optional(),
  WEATHER_API_KEY: z.string().optional(),
  MARKET_API_URL: z.string().optional(),
  MARKET_API_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`);
}
export const env = parsed.data;
