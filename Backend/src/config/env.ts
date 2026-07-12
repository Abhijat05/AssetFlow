import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string({ error: "DATABASE_URL is required" }),
  BETTER_AUTH_SECRET: z.string({ error: "BETTER_AUTH_SECRET is required" }),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  // Supabase Storage (file uploads: QR codes, attachments)
  SUPABASE_URL: z.string({ error: "SUPABASE_URL is required" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string({ error: "SUPABASE_SERVICE_ROLE_KEY is required" }),
  SUPABASE_STORAGE_BUCKET: z.string().default("assets"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  process.exit(1);
}

export const env = parsed.data;
