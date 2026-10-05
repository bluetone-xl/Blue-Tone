import { Logger } from '../core/logger.js';

/**
 * In-memory Rate Limiter service to manage cooldowns and prevent command spamming.
 */
export class RateLimiter {
  /**
   * @param {number} cooldownMs - Cooldown period in milliseconds (default: 3000ms / 3s).
   * @param {number} cleanupIntervalMs - Auto-cleanup stale records interval (default: 60,000ms / 1m).
   */
  constructor(cooldownMs = 3000, cleanupIntervalMs = 60000) {
    this.cooldownMs = Number(cooldownMs) || 3000;
    this.lastUsed = new Map();

    // Periodic cleanup to avoid memory leak for inactive users
    if (cleanupIntervalMs > 0) {
      setInterval(() => this.cleanup(), cleanupIntervalMs).unref?.();
    }
  }

  /**
   * Checks if a user is eligible to trigger an action or currently rate-limited.
   * Updates timestamp if action is allowed.
   *
   * @param {string|number} userId - Facebook User ID.
   * @returns {boolean} True if allowed, false if rate-limited.
   */
  check(userId) {
    if (!userId) return true;
    const cleanUserId = String(userId).trim();
    const now = Date.now();
    const last = this.lastUsed.get(cleanUserId) || 0;

    if (now - last < this.cooldownMs) {
      Logger.debug('RATE_LIMITER', `Rate limit exceeded for user: ${cleanUserId}`);
      return false;
    }

    this.lastUsed.set(cleanUserId, now);
    return true;
  }

  /**
   * Calculates remaining cooldown time in seconds for a specific user.
   *
   * @param {string|number} userId - Facebook User ID.
   * @returns {number} Cooldown remaining in seconds (0 if ready).
   */
  getRemainingCooldown(userId) {
    if (!userId) return 0;
    const cleanUserId = String(userId).trim();
    const now = Date.now();
    const last = this.lastUsed.get(cleanUserId) || 0;
    const remaining = this.cooldownMs - (now - last);

    return remaining > 0 ? Number((remaining / 1000).toFixed(1)) : 0;
  }

  /**
   * Cleans up expired user cooldown entries from memory map.
   */
  cleanup() {
    const now = Date.now();
    for (const [userId, last] of this.lastUsed.entries()) {
      if (now - last >= this.cooldownMs) {
        this.lastUsed.delete(userId);
      }
    }
  }
}

export const globalRateLimiter = new RateLimiter();
export default RateLimiter;
