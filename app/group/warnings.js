/**
 * In-memory store for tracking group member warning records and history.
 */
export class WarningStore {
  constructor() {
    this.records = new Map();
  }

  /**
   * Generates a composite key for group-user warning lookup.
   */
  _key(groupId, userId) {
    return `${String(groupId).trim()}:${String(userId).trim()}`;
  }

  /**
   * Retrieves current warning record for a user in a group.
   */
  get(groupId, userId) {
    if (!groupId || !userId) return null;

    const key = this._key(groupId, userId);
    return this.records.get(key) || {
      groupId: String(groupId).trim(),
      userId: String(userId).trim(),
      count: 0,
      warnings: []
    };
  }

  /**
   * Adds a warning record for a user in a specific group.
   */
  add(groupId, userId, reason = '') {
    if (!groupId || !userId) return null;

    const key = this._key(groupId, userId);
    const record = this.get(groupId, userId);

    record.count += 1;
    record.warnings.push({
      reason: reason ? String(reason).trim() : 'No reason provided',
      createdAt: new Date().toISOString()
    });

    this.records.set(key, record);
    return record;
  }

  /**
   * Resets/clears warnings for a user in a specific group.
   */
  reset(groupId, userId) {
    if (!groupId || !userId) return false;
    return this.records.delete(this._key(groupId, userId));
  }

  /**
   * Checks if a user has reached or exceeded the specified warning limit.
   */
  hasReachedLimit(groupId, userId, limit = 3) {
    if (!groupId || !userId) return false;
    const record = this.get(groupId, userId);
    return record ? record.count >= limit : false;
  }

  /**
   * Clears all stored warnings from memory.
   */
  clear() {
    this.records.clear();
  }
}

export default WarningStore;
