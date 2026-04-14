// GSR-DOC-900: In-memory token bucket rate limiter.
// Single-instance Azure SWA deployment; upgrade to Redis when scaling.

export type RateLimit = {
  windowMs: number;
  max: number;
};

export const RATE_LIMITS = {
  'auth/login': { windowMs: 15 * 60 * 1000, max: 5 },
  'auth/register': { windowMs: 60 * 60 * 1000, max: 3 },
  'auth/reset': { windowMs: 60 * 60 * 1000, max: 3 },
  'api/default': { windowMs: 60 * 1000, max: 100 },
  'api/upload': { windowMs: 60 * 1000, max: 10 },
  'api/coins/spend': { windowMs: 60 * 1000, max: 20 },
  'public/verify': { windowMs: 60 * 1000, max: 30 },
  'public/validate': { windowMs: 60 * 1000, max: 10 },
} as const satisfies Record<string, RateLimit>;

export type RateLimitKey = keyof typeof RATE_LIMITS;

type Bucket = {
  count: number;
  resetAt: number;
};

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 5 * 60 * 1000;

  check(
    key: string,
    limit: RateLimit,
  ): { allowed: boolean; retryAfter?: number } {
    this.maybeCleanup();

    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
      return { allowed: true };
    }

    if (bucket.count >= limit.max) {
      return {
        allowed: false,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }

    bucket.count += 1;
    return { allowed: true };
  }

  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

export const rateLimiter = new RateLimiter();

export function buildKey(
  scope: RateLimitKey,
  identifier: string,
): string {
  return `${scope}:${identifier}`;
}
