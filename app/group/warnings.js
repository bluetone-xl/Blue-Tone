class WarningStore {
  constructor() {
    this.records = new Map();
  }

  key(groupId, userId) {
    return `${String(groupId)}:${String(userId)}`;
  }

  get(groupId, userId) {
    return this.records.get(this.key(groupId, userId)) || {
      groupId: String(groupId),
      userId: String(userId),
      count: 0,
      warnings: []
    };
  }

  add(groupId, userId, reason = '') {
    const key = this.key(groupId, userId);
    const record = this.get(groupId, userId);

    record.count += 1;
    record.warnings.push({
      reason: String(reason),
      createdAt: new Date().toISOString()
    });

    this.records.set(key, record);

    return record;
  }

  reset(groupId, userId) {
    this.records.delete(this.key(groupId, userId));
  }

  hasReachedLimit(groupId, userId, limit = 3) {
    return this.get(groupId, userId).count >= limit;
  }
}

module.exports = WarningStore;
