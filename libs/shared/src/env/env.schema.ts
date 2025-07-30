import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  TELEGRAM_ENV: z.enum(['development', 'production']).default('development'),
  BULL_DASHBOARD: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default(false),
  TON_ENDPOINT: z.url().default('https://toncenter.com/api/v2/jsonRPC'),
  TONCENTER_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
