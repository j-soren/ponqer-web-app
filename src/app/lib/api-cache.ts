// Client-side API caching and deduplication utility

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T = unknown> {
  promise: Promise<T>;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  
  private readonly defaultTTL = 2 * 60 * 1000; // 2 minutes
  private readonly requestTimeout = 30 * 1000; // 30 seconds

  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.requestTimeout) {
        this.pendingRequests.delete(key);
      }
    }
  }

  async cachedFetch<T = unknown>(url: string, options?: RequestInit, ttl: number = this.defaultTTL): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache first (for GET requests)
    if (!options?.method || options.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && !this.isExpired(cached)) {
        return cached.data as T;
      }
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending.promise as Promise<T>;
    }

    // Cleanup old pending requests
    this.cleanupExpiredRequests();

    // Make new request
    const promise = this.makeRequest<T>(url, options).then((data) => {
      // Cache successful GET requests
      if (!options?.method || options.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }
      
      // Remove from pending
      this.pendingRequests.delete(cacheKey);
      return data;
    }).catch((error) => {
      // Remove from pending on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Track pending request
    this.pendingRequests.set(cacheKey, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  private async makeRequest<T = unknown>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }

  invalidate(pattern: string): void {
    // Invalidate cache entries that match the pattern
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// Global instance
export const apiCache = new ApiCache();

// Convenience functions
export const cachedFetch = (url: string, options?: RequestInit, ttl?: number) => 
  apiCache.cachedFetch(url, options, ttl);

export const invalidateCache = (pattern: string) => 
  apiCache.invalidate(pattern);

export const clearCache = () => 
  apiCache.clear();