import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

/**
 * Upstash-backed rate limiting for the paid OpenAI endpoints.
 *
 * Behaviour:
 * - When UPSTASH_REDIS_REST_URL/TOKEN are not configured, limiters are `null`
 *   and rate limiting is skipped (so local dev and pre-Upstash deploys work).
 * - If a limiter check throws (Upstash unreachable), we fail OPEN — a limiter
 *   outage must not take the API down.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

function createLimiter(tokens: number, window: Duration, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: true,
  });
}

// Text chat is cheaper than voice; voice mints realtime tokens, so keep it tighter.
export const chatRatelimit = createLimiter(20, "1 m", "ratelimit:chat");
export const voiceRatelimit = createLimiter(10, "1 m", "ratelimit:voice");

/**
 * Builds a stable rate-limit key, preferring the authenticated user id and
 * falling back to the client IP for unauthenticated/dev paths.
 */
export function clientIdentifier(
  request: Request,
  userId?: string | null,
): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
  return `ip:${ip}`;
}

type LimitOutcome = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Runs a limiter check. Returns `null` when rate limiting is disabled or the
 * check failed (fail-open), so callers only block on an explicit `success:false`.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<LimitOutcome | null> {
  if (!limiter) return null;
  try {
    return await limiter.limit(identifier);
  } catch (error) {
    console.error("[ratelimit] check failed; allowing request", error);
    return null;
  }
}

/** Standard 429 response with rate-limit headers. */
export function tooManyRequests(outcome: LimitOutcome) {
  const retryAfter = Math.max(0, Math.ceil((outcome.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "RateLimit-Limit": outcome.limit.toString(),
        "RateLimit-Remaining": outcome.remaining.toString(),
        "RateLimit-Reset": outcome.reset.toString(),
      },
    },
  );
}
