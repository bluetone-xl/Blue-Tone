/**
 * IdempotencyStore manages temporary in-memory duplicate checks with automatic TTL cleanup.
 */
export class IdempotencyStore {
  /**
   * @param {number} [ttlMs=300000] - Time to live in milliseconds (default: 5 minutes)
   * @param {number} [maxSize=1000] - Maximum capacity before auto-cleaning oldest entries
   */
  constructor(ttlMs = 300000, maxSize = 1000) {
    this.cache = new Map(); // Store key -> expiryTimestamp
    this.ttlMs = Number(ttlMs) || 300000;
    this.maxSize = Number(maxSize) || 1000;
  }

  /**
   * Cleans up expired cache entries.
   * @private
   */
  _cleanup() {
    try {
      const now = Date.now();
      for (const [key, expiry] of this.cache.entries()) {
        if (now >= expiry) {
          this.cache.delete(key);
        }
      }

      // Evict oldest entries if capacity exceeded
      if (this.cache.size > this.maxSize) {
        const oldestKeys = Array.from(this.cache.keys()).slice(0, this.cache.size - this.maxSize);
        oldestKeys.forEach(key => this.cache.delete(key));
      }
    } catch (err) {
      console.error('❌ [IdempotencyStore] Error during cache cleanup:', err.message);
    }
  }

  /**
   * Checks if a key exists and is not expired.
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    try {
      if (!key) return false;
      const safeKey = String(key).trim();
      if (!safeKey) return false;

      this._cleanup();

      const expiry = this.cache.get(safeKey);
      if (!expiry) return false;

      if (Date.now() >= expiry) {
        this.cache.delete(safeKey);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ [IdempotencyStore] Error checking key:', err.message);
      return false;
    }
  }

  /**
   * Adds a key to the cache with an expiration timestamp.
   * @param {string} key 
   * @returns {boolean}
   */
  add(key) {
    try {
      if (!key) return false;
      const safeKey = String(key).trim();
      if (!safeKey) return false;

      this._cleanup();

      const expiry = Date.now() + this.ttlMs;
      this.cache.set(safeKey, expiry);
      return true;
    } catch (err) {
      console.error('❌ [IdempotencyStore] Error adding key:', err.message);
      return false;
    }
  }

  /**
   * Manually removes a key from the cache.
   * @param {string} key 
   * @returns {boolean}
   */
  delete(key) {
    try {
      if (!key) return false;
      const safeKey = String(key).trim();
      return this.cache.delete(safeKey);
    } catch (err) {
      console.error('❌ [IdempotencyStore] Error deleting key:', err.message);
      return false;
    }
  }

  /**
   * Clears the entire cache.
   */
  clear() {
    try {
      this.cache.clear();
    } catch (err) {
      console.error('❌ [IdempotencyStore] Error clearing cache:', err.message);
    }
  }
}

export default IdempotencyStore;
