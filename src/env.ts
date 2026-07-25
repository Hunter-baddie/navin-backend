import { z } from 'zod';
import { logger } from './shared/logger/logger.js';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .regex(/^mongodb(\+srv)?:\/\/.+$/, 'MONGO_URI must start with mongodb:// or mongodb+srv://'),
  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET must be at least 32 characters long'),
  STELLAR_SECRET_KEY: z
    .string()
    .trim()
    .regex(/^S[A-Z2-7]{20,}$/, 'STELLAR_SECRET_KEY must be a valid Stellar secret key')
    .optional(),
  STELLAR_WEBHOOK_SECRET: z
    .string()
    .trim()
    .min(16, 'STELLAR_WEBHOOK_SECRET must be at least 16 characters')
    .optional(),
  STELLAR_NETWORK: z.enum(['testnet', 'public']).default('testnet'),
  ALLOWED_ORIGINS: z.string().default(''),
  REDIS_URL: z
    .string()
    .url('REDIS_URL must be a valid URL')
    .refine(value => value.startsWith('redis://') || value.startsWith('rediss://'), {
      message: 'REDIS_URL must start with redis:// or rediss://',
    })
    .default('redis://127.0.0.1:6379'),
  CORS_ORIGIN: z.string().default('*'),

  // SMTP (email)
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),

  // Twilio (SMS)
  TWILIO_SID: z.string().min(1).optional(),
  TWILIO_TOKEN: z.string().min(1).optional(),
  TWILIO_FROM: z.string().min(1).optional(),

  // S3 storage
  S3_BUCKET: z.string().min(1).optional(),
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL').optional(),
  S3_ACCESS_KEY: z.string().min(1).optional(),
  S3_SECRET_KEY: z.string().min(1).optional(),
  S3_REGION: z.string().min(1).optional(),

  // Stellar Soroban / Escrow
  SOROBAN_RPC_URL: z.string().url('SOROBAN_RPC_URL must be a valid URL').optional(),
  ESCROW_CONTRACT_ID: z.string().min(1).optional(),

  // Observability
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').optional(),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('❌ Invalid environment variables:');
  parsedEnv.error.issues.forEach(issue => {
    const key = issue.path.join('.') || 'ENV';
    logger.error(`- ${key}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
