// src/lib/cache-utils.ts

/**
 * Simple memory cache with TTL (Time To Live) support
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private defaultTTL: number;

  constructor(defaultTTLMs: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTTL = defaultTTLMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    this.cache.set(key, {
      value,
      timestamp: Date.now() + ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Enhanced sessionStorage wrapper with TTL support
 */
export class SessionStorageCache {
  private prefix: string;

  constructor(prefix: string = "app_cache_") {
    this.prefix = prefix;
  }

  set(key: string, value: any, ttlMs?: number): void {
    const fullKey = this.prefix + key;
    const timeKey = fullKey + "_time";

    try {
      sessionStorage.setItem(fullKey, JSON.stringify(value));
      if (ttlMs) {
        sessionStorage.setItem(timeKey, (Date.now() + ttlMs).toString());
      }
    } catch (e) {
      console.warn("Failed to save to sessionStorage:", e);
    }
  }

  get<T>(key: string): T | null {
    const fullKey = this.prefix + key;
    const timeKey = fullKey + "_time";

    try {
      const timeValue = sessionStorage.getItem(timeKey);
      if (timeValue && Date.now() > parseInt(timeValue)) {
        // Expired
        this.delete(key);
        return null;
      }

      const value = sessionStorage.getItem(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.warn("Failed to read from sessionStorage:", e);
      return null;
    }
  }

  has(key: string): boolean {
    const fullKey = this.prefix + key;
    const timeKey = fullKey + "_time";

    const timeValue = sessionStorage.getItem(timeKey);
    if (timeValue && Date.now() > parseInt(timeValue)) {
      // Expired
      this.delete(key);
      return false;
    }

    return sessionStorage.getItem(fullKey) !== null;
  }

  delete(key: string): void {
    const fullKey = this.prefix + key;
    const timeKey = fullKey + "_time";

    sessionStorage.removeItem(fullKey);
    sessionStorage.removeItem(timeKey);
  }

  clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

/**
 * Throttle function calls to prevent excessive API requests
 */
export class Throttle {
  private lastCall = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(private func: (...args: any[]) => any, private delay: number) {}

  call(...args: any[]): void {
    const now = Date.now();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (now - this.lastCall >= this.delay) {
      this.lastCall = now;
      this.func(...args);
    } else {
      this.timeoutId = setTimeout(() => {
        this.lastCall = Date.now();
        this.func(...args);
        this.timeoutId = null;
      }, this.delay - (now - this.lastCall));
    }
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Debounce function calls
 */
export class Debounce {
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(private func: (...args: any[]) => any, private delay: number) {}

  call(...args: any[]): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.func(...args);
      this.timeoutId = null;
    }, this.delay);
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

// Pre-configured instances for common use cases
export const authCache = new MemoryCache<any>(5 * 60 * 1000); // 5 minutes
export const adminCache = new MemoryCache<boolean>(5 * 60 * 1000); // 5 minutes
export const sessionCache = new SessionStorageCache("portfolio_");

// Cleanup expired cache entries every 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    authCache.cleanup();
    adminCache.cleanup();
  }, 10 * 60 * 1000);
}
