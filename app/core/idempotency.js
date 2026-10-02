export class IdempotencyStore {
  constructor() {
    this.cache = new Set();
  }

  has(key) {
    return this.cache.has(key);
  }

  add(key) {
    this.cache.add(key);
  }
}

export default IdempotencyStore;
