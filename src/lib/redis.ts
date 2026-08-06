import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
// When you create an Upstash Redis DB from the Vercel dashboard / marketplace
// and link it to this project, these env vars are set automatically.

/**
 * Check if Redis is configured via environment variables
 */
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && 
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

let _redis: Redis | null = null;

/**
 * Get Redis instance if configured, otherwise returns null
 */
export function getRedis(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }
  
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  
  return _redis;
}

// Keep redis export for backward compatibility - will throw if not configured
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const r = getRedis();
    if (!r) {
      throw new Error("Redis is not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.");
    }
    return (r as any)[prop];
  }
});
