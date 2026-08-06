import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env.
// When you create an Upstash Redis DB from the Vercel dashboard / marketplace
// and link it to this project, these env vars are set automatically.
export const redis = Redis.fromEnv();
