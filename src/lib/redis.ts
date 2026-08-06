import { Redis } from "@upstash/redis";

function getRedisConfig(): { url?: string; token?: string } {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_URL ||
    process.env.REDIS_URL ||
    "";

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_TOKEN ||
    process.env.REDIS_TOKEN ||
    "";

  return { url, token };
}

/**
 * Check if Redis is configured via environment variables.
 * Supports both Upstash's default names and common aliases.
 */
export function isRedisConfigured(): boolean {
  const { url, token } = getRedisConfig();
  return Boolean(url && token);
}

let _redis: Redis | null = null;

/**
 * Get Redis instance if configured, otherwise returns null.
 */
export function getRedis(): Redis | null {
  const { url, token } = getRedisConfig();

  if (!url || !token) {
    return null;
  }

  if (!_redis) {
    _redis = new Redis({ url, token });
  }

  return _redis;
}

// Keep redis export for backward compatibility - will throw if not configured.
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const r = getRedis();
    if (!r) {
      throw new Error(
        "Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or the alias env vars) in Vercel environment variables."
      );
    }

    return (r as unknown as Record<string, unknown>)[prop as string];
  },
});
