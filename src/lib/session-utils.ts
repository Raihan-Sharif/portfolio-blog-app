// src/lib/session-utils.ts

/**
 * Utilities for managing session state and preventing unnecessary refreshes
 */

export class SessionStateManager {
  private static instance: SessionStateManager;
  private lastActivity: number = Date.now();
  private focusListeners: Set<() => void> = new Set();
  private isActive: boolean = true;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.initializeListeners();
    }
  }

  static getInstance(): SessionStateManager {
    if (!SessionStateManager.instance) {
      SessionStateManager.instance = new SessionStateManager();
    }
    return SessionStateManager.instance;
  }

  private initializeListeners() {
    // Track user activity
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    // Listen for user interactions
    document.addEventListener("mousedown", updateActivity);
    document.addEventListener("keydown", updateActivity);
    document.addEventListener("scroll", updateActivity);
    document.addEventListener("touchstart", updateActivity);

    // Track focus/blur
    window.addEventListener("focus", () => {
      this.isActive = true;
      this.notifyFocusListeners();
    });

    window.addEventListener("blur", () => {
      this.isActive = false;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.isActive = true;
        this.notifyFocusListeners();
      } else {
        this.isActive = false;
      }
    });
  }

  private notifyFocusListeners() {
    this.focusListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in focus listener:", error);
      }
    });
  }

  /**
   * Register a callback to be called when the tab gains focus
   */
  onFocus(callback: () => void): () => void {
    this.focusListeners.add(callback);
    return () => {
      this.focusListeners.delete(callback);
    };
  }

  /**
   * Check if the user has been inactive for a certain duration
   */
  isInactive(durationMs: number): boolean {
    return Date.now() - this.lastActivity > durationMs;
  }

  /**
   * Check if the tab is currently active
   */
  isTabActive(): boolean {
    return this.isActive && document.visibilityState === "visible";
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * Start periodic session validation
   */
  startSessionValidation(
    callback: () => void,
    intervalMs: number = 5 * 60 * 1000
  ) {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(() => {
      // Only validate if tab is active and user has been active recently
      if (this.isTabActive() && !this.isInactive(30 * 60 * 1000)) {
        callback();
      }
    }, intervalMs);
  }

  /**
   * Stop session validation
   */
  stopSessionValidation() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopSessionValidation();
    this.focusListeners.clear();
  }
}

/**
 * Enhanced cache with automatic cleanup
 */
export class EnhancedCache<T> {
  private cache = new Map<
    string,
    { value: T; timestamp: number; accessed: number }
  >();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTLMs: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
    this.startCleanup();
  }

  private startCleanup() {
    // Clean up every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL;
    const now = Date.now();

    // If cache is full, remove least recently accessed item
    if (this.cache.size >= this.maxSize) {
      let lruKey = "";
      let lruTime = now;

      for (const [k, v] of this.cache.entries()) {
        if (v.accessed < lruTime) {
          lruTime = v.accessed;
          lruKey = k;
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: now + ttl,
      accessed: now,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    // Update access time
    entry.accessed = now;
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

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * Debounced function executor to prevent rapid successive calls
 */
export class DebouncedExecutor {
  private timeoutId: NodeJS.Timeout | null = null;
  private lastExecution: number = 0;

  constructor(
    private func: (...args: any[]) => any,
    private delay: number,
    private maxWait?: number
  ) {}

  execute(...args: any[]): void {
    const now = Date.now();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // If maxWait is set and we haven't executed in a while, execute immediately
    if (this.maxWait && now - this.lastExecution >= this.maxWait) {
      this.lastExecution = now;
      this.func(...args);
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.lastExecution = Date.now();
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

// Pre-configured instances
export const sessionManager = SessionStateManager.getInstance();
export const authCache = new EnhancedCache<any>(50, 10 * 60 * 1000); // 10 minutes TTL
export const adminCache = new EnhancedCache<boolean>(20, 10 * 60 * 1000); // 10 minutes TTL

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    authCache.destroy();
    adminCache.destroy();
    sessionManager.destroy();
  });
}
