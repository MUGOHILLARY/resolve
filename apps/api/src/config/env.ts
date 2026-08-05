import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: Number(process.env.PORT ?? 4000),

  FRONTEND_URL:
    process.env.FRONTEND_URL ?? "http://localhost:5173",

  SUPABASE_URL: required("SUPABASE_URL"),

  SUPABASE_SERVICE_ROLE_KEY: required(
    "SUPABASE_SERVICE_ROLE_KEY"
  ),

  OPENAI_API_KEY: required("OPENAI_API_KEY"),
};