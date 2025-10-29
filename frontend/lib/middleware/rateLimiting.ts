/**
 * Rate Limiting Middleware
 *
 * @description Memory-based rate limiting middleware for API endpoints
 * @version 1.0.0
 * @date 2025-10-29
 *
 * **NOTE**: This is a development implementation using in-memory storage.
 * For production, replace with Redis or another distributed storage solution.
 *
 * @see https://expressjs.com/en/resources/middleware/rate-limit.html
 * @see docs/RAZORPAY_INTEGRATION_GUIDE.md
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  resetTimeSeconds: number;
  limit: number;
  windowMs: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  status: RateLimitStatus;
  error?: {
    message: string;
    code: string;
    retryAfter?: number;
  };
}

/**
 * Rate limit entry in storage
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  /** Payment verification: 5 requests per minute per user */
  PAYMENT_VERIFICATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyGenerator: (request: Request) => {
      // Try to get user ID from auth headers, fallback to IP
      const userId = request.headers.get('x-user-id');
      const ip = getClientIP(request);
      return `payment-verify:${userId || ip}`;
    },
    message: 'Too many payment verification attempts. Please try again later.',
  } as RateLimitConfig,

  /** Subscription creation: 10 requests per minute per user */
  SUBSCRIPTION_CREATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (request: Request) => {
      const userId = request.headers.get('x-user-id');
      const ip = getClientIP(request);
      return `subscription-create:${userId || ip}`;
    },
    message: 'Too many subscription creation attempts. Please try again later.',
  } as RateLimitConfig,

  /** General API: 100 requests per minute per IP */
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (request: Request) => {
      return `general:${getClientIP(request)}`;
    },
    message: 'Too many requests. Please slow down.',
  } as RateLimitConfig,
} as const;

// ============================================================================
// In-Memory Storage (Development Only)
// ============================================================================

/**
 * In-memory rate limit store
 * **DEVELOPMENT ONLY** - Replace with Redis for production
 */
class MemoryRateLimitStore {
  public store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const keys = Array.from(this.store.keys());

    for (const key of keys) {
      const entry = this.store.get(key);
      if (entry && now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global instance for development
const memoryStore = new MemoryRateLimitStore();

// ============================================================================
// Core Rate Limiting Logic
// ============================================================================

/**
 * Extract client IP from request
 *
 * @param request - HTTP request
 * @returns Client IP address
 */
function getClientIP(request: Request): string {
  // Check various headers for real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default IP for development/testing
  return '127.0.0.1';
}

/**
 * Create a rate limiter with the specified configuration
 *
 * @param config - Rate limit configuration
 * @returns Rate limiter function
 *
 * @example
 * const rateLimiter = createRateLimit(RATE_LIMIT_CONFIGS.PAYMENT_VERIFICATION);
 * const result = await rateLimiter(request);
 */
export function createRateLimit(config: RateLimitConfig): (request: Request) => Promise<RateLimitResult> {
  return async (request: Request): Promise<RateLimitResult> => {
    const now = Date.now();
    const key = config.keyGenerator ? config.keyGenerator(request) : getClientIP(request);

    // Get current rate limit entry
    let entry = memoryStore.get(key);

    // Create new entry if it doesn't exist or if window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        windowStart: now,
        resetTime: now + config.windowMs,
      };
      memoryStore.set(key, entry);
    }

    // Increment request count
    entry.count += 1;
    memoryStore.set(key, entry);

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);

    const status: RateLimitStatus = {
      allowed: entry.count <= config.maxRequests,
      remaining,
      resetTime: entry.resetTime,
      resetTimeSeconds,
      limit: config.maxRequests,
      windowMs: config.windowMs,
    };

    // Build result
    const result: RateLimitResult = {
      allowed: status.allowed,
      status,
    };

    // Add error details if rate limited
    if (!status.allowed) {
      result.error = {
        message: config.message || 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetTimeSeconds,
      };
    }

    return result;
  };
}

/**
 * Create a rate limiter middleware for Next.js API routes
 *
 * @param config - Rate limit configuration
 * @returns Next.js middleware function
 *
 * @example
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimitMiddleware(RATE_LIMIT_CONFIGS.PAYMENT_VERIFICATION)(request);
 *
 *   if (!rateLimitResult.allowed) {
 *     return NextResponse.json(
 *       { error: rateLimitResult.error?.message, code: rateLimitResult.error?.code },
 *       { status: 429, headers: { 'Retry-After': String(rateLimitResult.error?.retryAfter) } }
 *     );
 *   }
 *
 *   // Proceed with API logic
 * }
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  const rateLimiter = createRateLimit(config);

  return async (request: Request): Promise<RateLimitResult> => {
    return await rateLimiter(request);
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a specific key is rate limited
 *
 * @param key - Rate limit key
 * @param config - Rate limit configuration
 * @returns Rate limit status
 *
 * @example
 * const status = isRateLimited('user:123', RATE_LIMIT_CONFIGS.PAYMENT_VERIFICATION);
 */
export function isRateLimited(key: string, config: RateLimitConfig): RateLimitStatus {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      resetTimeSeconds: Math.ceil(config.windowMs / 1000),
      limit: config.maxRequests,
      windowMs: config.windowMs,
    };
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);

  return {
    allowed: entry.count <= config.maxRequests,
    remaining,
    resetTime: entry.resetTime,
    resetTimeSeconds,
    limit: config.maxRequests,
    windowMs: config.windowMs,
  };
}

/**
 * Reset rate limit for a specific key
 *
 * @param key - Rate limit key to reset
 *
 * @example
 * resetRateLimit('user:123');
 */
export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
}

/**
 * Get rate limit statistics for monitoring
 *
 * @returns Statistics about current rate limit usage
 *
 * @example
 * const stats = getRateLimitStats();
 * console.log(`Active rate limits: ${stats.activeEntries}`);
 */
export function getRateLimitStats(): {
  activeEntries: number;
  totalMemoryUsage: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const entries = Array.from(memoryStore.store.entries());
  const now = Date.now();

  if (entries.length === 0) {
    return {
      activeEntries: 0,
      totalMemoryUsage: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  const timestamps = entries.map(([_, entry]) => entry.windowStart);
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);

  return {
    activeEntries: entries.length,
    totalMemoryUsage: entries.length * 200, // Estimated bytes per entry
    oldestEntry: oldest,
    newestEntry: newest,
  };
}

/**
 * Cleanup expired rate limit entries
 *
 * This function is called automatically, but can be called manually
 * if needed.
 *
 * @example
 * cleanupExpiredEntries();
 */
export function cleanupExpiredEntries(): void {
  memoryStore.cleanup();
}

/**
 * Clear all rate limit entries (useful for testing)
 *
 * @example
 * clearAllRateLimits();
 */
export function clearAllRateLimits(): void {
  memoryStore.clear();
}

/**
 * Create rate limit headers for HTTP responses
 *
 * @param status - Rate limit status
 * @returns Headers object with rate limit information
 *
 * @example
 * const headers = createRateLimitHeaders(rateLimitResult.status);
 * return new NextResponse(response, { headers });
 */
export function createRateLimitHeaders(status: RateLimitStatus): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(status.limit),
    'X-RateLimit-Remaining': String(status.remaining),
    'X-RateLimit-Reset': String(Math.ceil(status.resetTime / 1000)),
    'X-RateLimit-Reset-Seconds': String(status.resetTimeSeconds),
  };
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Simulate rate limit exhaustion for testing
 *
 * @param key - Rate limit key to exhaust
 * @param config - Rate limit configuration
 *
 * @example
 * exhaustRateLimit('user:123', RATE_LIMIT_CONFIGS.PAYMENT_VERIFICATION);
 */
export function exhaustRateLimit(key: string, config: RateLimitConfig): void {
  const entry: RateLimitEntry = {
    count: config.maxRequests + 1,
    windowStart: Date.now(),
    resetTime: Date.now() + config.windowMs,
  };
  memoryStore.set(key, entry);
}

/**
 * Get all active rate limit keys (useful for debugging)
 *
 * @returns Array of active rate limit keys
 *
 * @example
 * const keys = getActiveRateLimitKeys();
 * console.log('Active keys:', keys);
 */
export function getActiveRateLimitKeys(): string[] {
  return Array.from(memoryStore.store.keys());
}

// Export memory store for advanced usage (development only)
export { memoryStore as devMemoryStore };

// Cleanup on process exit (development only)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  process.on('SIGTERM', () => {
    memoryStore.destroy();
  });

  process.on('SIGINT', () => {
    memoryStore.destroy();
  });
}