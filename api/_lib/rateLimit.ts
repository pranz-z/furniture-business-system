type RateBucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateBucket>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 15

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  buckets.set(key, existing)
  return { allowed: true, retryAfterSec: 0 }
}

// Periodic cleanup to avoid unbounded growth in long-lived processes.
if (typeof setInterval === 'function') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, WINDOW_MS).unref?.()
}
