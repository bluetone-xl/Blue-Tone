const userCooldowns = new Map();

export class RateLimiter {
  constructor(cooldownMs = 3000) {
    this.cooldownMs = cooldownMs; // Default 3 seconds per command
  }

  isRateLimited(userId) {
    const now = Date.now();
    const lastExecution = userCooldowns.get(userId);

    if (lastExecution && now - lastExecution < this.cooldownMs) {
      const remaining = ((this.cooldownMs - (now - lastExecution)) / 1000).toFixed(1);
      return { limited: true, remaining };
    }

    userCooldowns.set(userId, now);
    return { limited: false };
  }
}

export default RateLimiter;
