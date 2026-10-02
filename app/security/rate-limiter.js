export class RateLimiter {
  constructor(cooldownMs = 3000) {
    this.cooldownMs = cooldownMs;
    this.lastUsed = new Map();
  }

  check(userId) {
    const now = Date.now();
    const last = this.lastUsed.get(userId) || 0;

    if (now - last < this.cooldownMs) {
      return false;
    }

    this.lastUsed.set(userId, now);
    return true;
  }

  getRemainingCooldown(userId) {
    const now = Date.now();
    const last = this.lastUsed.get(userId) || 0;
    const remaining = this.cooldownMs - (now - last);
    return remaining > 0 ? remaining / 1000 : 0;
  }
}

export default RateLimiter;
