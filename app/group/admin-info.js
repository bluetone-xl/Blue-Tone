class AdminInfoStore {
  constructor() {
    this.records = new Map();
  }

  key(groupId, userId) {
    return `${String(groupId)}:${String(userId)}`;
  }

  set(groupId, userId, data = {}) {
    const record = {
      groupId: String(groupId),
      userId: String(userId),
      name: data.name || '',
      role: data.role || 'Group Admin',
      phone: data.phone || '',
      facebook: data.facebook || '',
      note: data.note || ''
    };

    this.records.set(this.key(groupId, userId), record);

    return record;
  }

  get(groupId, userId) {
    return this.records.get(this.key(groupId, userId)) || null;
  }

  remove(groupId, userId) {
    return this.records.delete(this.key(groupId, userId));
  }

  list(groupId) {
    const result = [];
    const id = String(groupId);

    for (const record of this.records.values()) {
      if (record.groupId === id) {
        result.push(record);
      }
    }

    return result;
  }
}

module.exports = AdminInfoStore;
