/**
 * In-memory store for managing group administrator contact info and metadata.
 */
export class AdminInfoStore {
  constructor() {
    this.records = new Map();
  }

  /**
   * Generates a composite lookup key for group-user pairing.
   */
  _key(groupId, userId) {
    return `${String(groupId).trim()}:${String(userId).trim()}`;
  }

  /**
   * Sets or updates admin info for a specific group member.
   */
  set(groupId, userId, data = {}) {
    if (!groupId || !userId) return null;

    const record = {
      groupId: String(groupId).trim(),
      userId: String(userId).trim(),
      name: data.name ? String(data.name).trim() : '',
      role: data.role ? String(data.role).trim() : 'Group Admin',
      phone: data.phone ? String(data.phone).trim() : '',
      facebook: data.facebook ? String(data.facebook).trim() : '',
      note: data.note ? String(data.note).trim() : '',
      updatedAt: new Date()
    };

    this.records.set(this._key(groupId, userId), record);
    return record;
  }

  /**
   * Retrieves stored admin details.
   */
  get(groupId, userId) {
    if (!groupId || !userId) return null;
    return this.records.get(this._key(groupId, userId)) || null;
  }

  /**
   * Removes an admin record.
   */
  remove(groupId, userId) {
    if (!groupId || !userId) return false;
    return this.records.delete(this._key(groupId, userId));
  }

  /**
   * Lists all admins for a specific group.
   */
  list(groupId) {
    if (!groupId) return [];
    
    const targetGroupId = String(groupId).trim();
    const result = [];

    for (const record of this.records.values()) {
      if (record.groupId === targetGroupId) {
        result.push(record);
      }
    }

    return result;
  }

  /**
   * Clears all stored records.
   */
  clear() {
    this.records.clear();
  }
}

export default AdminInfoStore;
