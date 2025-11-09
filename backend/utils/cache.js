/**
 * Simple in-memory cache utility for frequently accessed data
 * Use Redis in production for distributed caching
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  /**
   * Set cache with TTL (time to live in seconds)
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    
    // Set expiration
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.ttl.set(key, expiresAt);
    
    // Auto-cleanup after TTL
    setTimeout(() => this.delete(key), ttlSeconds * 1000);
    
    return true;
  }

  /**
   * Get cached value
   */
  get(key) {
    // Check if expired
    const expiresAt = this.ttl.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key) || null;
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
    return true;
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    const expiresAt = this.ttl.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }

  /**
   * Get or set pattern (common usage)
   */
  async getOrSet(key, fetchFunction, ttlSeconds = 300) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFunction();
    this.set(key, value, ttlSeconds);
    return value;
  }
}

// Singleton instance
const cache = new SimpleCache();

module.exports = cache;
