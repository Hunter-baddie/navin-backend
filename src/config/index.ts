import { env } from '../env.js';

const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  stellarSecretKey: env.STELLAR_SECRET_KEY,
  stellarNetwork: env.STELLAR_NETWORK,
  allowedOrigins,
  redisUrl: env.REDIS_URL,
  corsOrigin: env.CORS_ORIGIN,

  // SMTP (email)
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  // Twilio (SMS)
  twilio: {
    sid: env.TWILIO_SID,
    token: env.TWILIO_TOKEN,
    from: env.TWILIO_FROM,
  },

  // S3 storage
  s3: {
    bucket: env.S3_BUCKET,
    endpoint: env.S3_ENDPOINT,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
  },

  // Stellar Soroban / Escrow
  sorobanRpcUrl: env.SOROBAN_RPC_URL,
  escrowContractId: env.ESCROW_CONTRACT_ID,

  // Observability
  sentryDsn: env.SENTRY_DSN,

  // Frontend
  frontendUrl: env.FRONTEND_URL,
} as const;
