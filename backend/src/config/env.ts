import "dotenv/config";

export const isLocalDb =
  !process.env.SUPABASE_URL ||
  process.env.SUPABASE_URL.includes("placeholder") ||
  !process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY.includes("placeholder") ||
  process.env.USE_LOCAL_DB === "true";

function required(name: string): string {
  const value = process.env[name];
  if (!value && !isLocalDb) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || "placeholder";
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  isLocalDb,

  supabase: {
    url: required("SUPABASE_URL"),
    anonKey: required("SUPABASE_ANON_KEY"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  },
};
