import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => Number(val)),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/gearup_db?schema=public'),
  BCRYPT_SALT_ROUNDS: z.string().default('10').transform((val) => Number(val)),
  JWT_ACCESS_SECRET: z.string().default('gearup_super_secret_jwt_access_key_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('7d'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid Environment Variables Configuration:', result.error.format());
    throw new Error('Environment variable validation failed');
  }
  return result.data;
};

const envVars = parseEnv();

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database_url: envVars.DATABASE_URL,
  bcrypt_salt_rounds: envVars.BCRYPT_SALT_ROUNDS,
  jwt: {
    access_secret: envVars.JWT_ACCESS_SECRET,
    access_expires_in: envVars.JWT_ACCESS_EXPIRES_IN,
  },
  stripe: {
    secret_key: envVars.STRIPE_SECRET_KEY,
    webhook_secret: envVars.STRIPE_WEBHOOK_SECRET,
  },
};

export default config;
