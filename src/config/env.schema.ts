import { z } from 'zod';

const optionalNonEmpty = z.string().min(1).optional();

export const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    PORT: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_USERNAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_DATABASE: z.string().min(1),
    TYPEORM_SYNC: z.enum(['true', 'false']).optional(),
    JWT_SECRET: z.string().min(1),
    JWT_ISSUER: z.string().min(1),
    JWT_AUDIENCE: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
    CORS_ORIGINS: z.string().min(1),
    EMAIL_DRIVER: z.enum(['console', 'smtp']).optional(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
    REDIS_HOST: optionalNonEmpty,
    REDIS_PORT: z.string().min(1).optional(),
    SMTP_HOST: optionalNonEmpty,
    SMTP_PORT: z.string().min(1).optional(),
    SMTP_SECURE: z.enum(['true', 'false']).optional(),
    SMTP_USER: optionalNonEmpty,
    SMTP_PASSWORD: optionalNonEmpty,
    SMTP_FROM: optionalNonEmpty,
  })
  .passthrough();

export type EnvSchema = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): Record<string, unknown> => {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment variables: ${issues}`);
  }
  return parsed.data;
};
