import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default(60000),
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default(100),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function parseEnv(env: NodeJS.ProcessEnv): AppConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }
  return Object.freeze(result.data);
}

// Module-level: runs at startup; exits process on failure
const config = (() => {
  // Skip config loading in test environment to allow parseEnv to be tested independently
  if (process.env.NODE_ENV === "test") {
    return null;
  }
  try {
    return parseEnv(process.env);
  } catch (err) {
    /* istanbul ignore next */
    process.stderr.write(`FATAL: ${(err as Error).message}\n`);
    process.exit(1);
  }
})();

export default config as AppConfig | null;
