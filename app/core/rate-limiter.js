/**
 * RateLimiter controls command execution frequency per user to prevent spam and memory leaks.
 */
export class RateLimiter {
  /**
   * @param {number} [cooldownMs=3000] - Cooldown period in milliseconds
   * @param {number} [maxCapacity=2000] - Maximum stored user entries before forced cleanup
   */
  constructor(cooldownMs = 3000, maxCapacity = 2000) {
    this.cooldownMs = Number(cooldownMs) || 3000;
    this.maxCapacity = Number(maxCapacity) || 2000;
    this.userCooldowns = new Map();
  }

  /**
   * Performs internal cleanup of expired entries.
   * @private
   */
  _cleanup() {
    try {
      const now = Date.now();
      for (const [userId, lastExecution] of this.userCooldowns.entries()) {
        if (now - lastExecution >= this.cooldownMs) {
          this.userCooldowns.delete(userId);
        }
      }

      // Evict oldest entries if map exceeds maximum capacity
      if (this.userCooldowns.size > this.maxCapacity) {
        const oldestKeys = Array.from(this.userCooldowns.keys()).slice(0, this.userCooldowns.size - this.maxCapacity);
        oldestKeys.forEach(key => this.userCooldowns.delete(key));
      }
    } catch (err) {
      console.error('❌ [RateLimiter] Error during cooldown cleanup:', err.message);
    }
  }

  /**
   * Checks if a user is currently rate limited.
   * @param {string|number} userId 
   * @returns {Object} { limited: boolean, remaining?: string }
   */
  isRateLimited(userId) {
    try {
      if (!userId) {
        return { limited: false };
      }

      const safeUserId = String(userId).trim();
      if (!safeUserId) {
        return { limited: false };
      }

      const now = Date.now();
      this._cleanup();

      const lastExecution = this.userCooldowns.get(safeUserId);

      if (lastExecution && (now - lastExecution) < this.cooldownMs) {
        const remaining = ((this.cooldownMs - (now - lastExecution)) / 1000).toFixed(1);
        return { limited: true, remaining };
      }

      this.userCooldowns.set(safeUserId, now);
      return { limited: false };
    } catch (err) {
      console.error('❌ [RateLimiter] Error checking rate limit:', err.message);
      return { limited: false };
    }
  }

  /**
   * Resets the rate limit for a specific user.
   * @param {string|number} userId 
   */
  reset(userId) {
    try {
      if (!userId) return;
      const safeUserId = String(userId).trim();
      this.userCooldowns.delete(safeUserId);
    } catch (err) {
      console.error('❌ [RateLimiter] Error resetting user cooldown:', err.message);
    }
  }

  /**
   * Clears all rate limits.
   */
  clear() {
    try {
      this.userCooldowns.clear();
    } catch (err) {
      console.error('❌ [RateLimiter] Error clearing rate limiter:', err.message);
    }
  }
}

export default RateLimiter;
