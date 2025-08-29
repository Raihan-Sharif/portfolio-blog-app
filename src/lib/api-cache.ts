/**
 * Simple in-memory cache to prevent duplicate API calls
 * Especially useful in React StrictMode which mounts components twice
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5000; // 5 seconds

  /**
   * Get cached data or execute the function and cache the result
   */
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if it's still valid
    if (cached && (now - cached.timestamp) < ttl) {
      console.log(`📋 Cache hit for: ${key}`);
      return cached.data;
    }

    // If there's an ongoing request, return that promise
    if (cached?.promise) {
      console.log(`⏳ Request in progress for: ${key}`);
      return cached.promise;
    }

    console.log(`🌐 Making fresh request for: ${key}`);

    // Create new request
    const promise = fetcher();
    
    // Cache the promise immediately to prevent duplicate calls
    this.cache.set(key, {
      data: null,
      timestamp: now,
      promise
    });

    try {
      const data = await promise;
      
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: now,
        promise: undefined
      });

      return data;
    } catch (error) {
      // Remove failed request from cache
      this.cache.delete(key);
      throw error;
    }
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(ttl: number = this.defaultTTL) {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

/**
 * Helper hook to use cached API calls
 */
export function useCachedApi() {
  return {
    get: apiCache.get.bind(apiCache),
    clear: apiCache.clear.bind(apiCache),
    clearAll: apiCache.clearAll.bind(apiCache),
  };
}