import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // --- Server Configuration ---
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('127.0.0.1'),
  BASE_URL: z.url('BASE_URL must be a valid URL'),

  // --- Database ---
  DATABASE_URL: z.string().min(1, 'DATABASE_URL là bắt buộc'),

  // --- URLs ---
  SENTRY_URL: z
    .string()
    .url('Định dạng URL Sentry không hợp lệ')
    .optional()
    .or(z.literal('')),
  CLIENT_ORIGIN: z.url('CLIENT_ORIGIN must be a valid URL'),
  SERVER_URL: z.url('SERVER_URL must be a valid URL'),
  CLIENT_URL: z.url('CLIENT_URL must be a valid URL'),
  URL_REDIRECT_FE: z.url('URL_REDIRECT_FE must be a valid URL'),

  // --- Auth / JWT ---
  ACCESS_TOKEN_SECRET_SIGNATURE: z
    .string()
    .min(1, 'ACCESS_TOKEN_SECRET_SIGNATURE là bắt buộc'),
  ACCESS_TOKEN_LIFE: z
    .string()
    .regex(/^\d+[mhd]$/, "Format must be like '1h', '7d', or '30m'"),

  REFRESH_TOKEN_SECRET_SIGNATURE: z
    .string()
    .min(1, 'REFRESH_TOKEN_SECRET_SIGNATURE là bắt buộc'),
  REFRESH_TOKEN_LIFE: z
    .string()
    .regex(/^\d+[mhd]$/, "Format must be like '1h', '7d', or '30m'"),

  BCRYPT_ROUNDS: z.coerce.number().default(10),

  // --- Mail Service (Brevo) ---
  BREVO_API_KEY: z.string().min(1, 'BREVO_API_KEY là bắt buộc'),
  ADMIN_EMAIL_ADDRESS: z.string().email('Địa chỉ email admin không hợp lệ'),
  ADMIN_EMAIL_NAME: z.string().min(1, 'Tên email admin là bắt buộc'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY là bắt buộc'),

  // --- Security ---
  COOKIE_SECRET: z.string().min(1, 'COOKIE_SECRET là bắt buộc'),

  // --- Image Hosting (ImageKit) ---
  IMAGE_KIT_PUBLIC_KEY: z.string().min(1, 'IMAGE_KIT_PUBLIC_KEY là bắt buộc'),
  IMAGE_KIT_PRIVATE_KEY: z.string().min(1, 'IMAGE_KIT_PRIVATE_KEY là bắt buộc'),
  IMAGE_KIT_URL_ENDPOINT: z
    .string()
    .url('IMAGE_KIT_URL_ENDPOINT phải là một URL hợp lệ'),

  // --- Social Login ---
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID là bắt buộc'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET là bắt buộc'),
  GOOGLE_REDIRECT_URI: z.url('GOOGLE_REDIRECT_URI là bắt buộc'),

  // --- Super Admin Seeding ---
  SUPER_ADMIN_EMAIL: z.email('Địa chỉ email super admin không hợp lệ').optional(),
  SUPER_ADMIN_PASSWORD: z
    .string()
    .min(6, 'Mật khẩu super admin phải có ít nhất 6 ký tự')
    .optional(),
  SUPER_ADMIN_NAME: z
    .string()
    .min(1, 'Tên super admin là bắt buộc')
    .optional(),

  // --- Scalar API Key ---
  SCALAR_API_KEY: z
    .string()
    .optional()
    .transform((val) => val?.trim()),

  // --- VNPAY Payment Gateway ---
  VNP_TMN_CODE: z
    .string()
    .min(1, 'VNP_TMN_CODE là bắt buộc')
    .transform((val) => val.trim()),
  VNP_HASH_SECRET: z
    .string()
    .min(1, 'VNP_HASH_SECRET là bắt buộc')
    .transform((val) => val.trim()),
  VNP_URL: z
    .url('VNP_URL phải là một URL hợp lệ')
    .transform((val) => val.trim()),
  VNP_RETURN_URL: z
    .url('VNP_RETURN_URL phải là một URL hợp lệ')
    .transform((val) => val.trim()),
});

// Parse and Validate
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');

  // Clean error reporting
  _env.error.issues.forEach((issue) => {
    console.error(`   - [${issue.path.join('.')}] : ${issue.message}`);
  });

  process.exit(1);
}

const envData = _env.data;

export const ENV_CONFIG = {
  ...envData,
  IS_DEVELOPMENT: envData.NODE_ENV === 'development',
  IS_PRODUCTION: envData.NODE_ENV === 'production',

  // Strict typing for Token Life
  ACCESS_TOKEN_LIFE: envData.ACCESS_TOKEN_LIFE as `${number}${'m' | 'h' | 'd'}`,
  REFRESH_TOKEN_LIFE:
    envData.REFRESH_TOKEN_LIFE as `${number}${'m' | 'h' | 'd'}`,
} as const;

export type EnvConfig = z.infer<typeof envSchema>;
