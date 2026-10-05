/**
 * In-memory store for tracking and checking group administrator permissions.
 */
export class GroupAdminStore {
  constructor() {
    this.admins = new Map();
  }

  /**
   * Ensures a Set exists for the target group and returns it.
   */
  ensureGroup(groupId) {
    if (!groupId) return new Set();
    const id = String(groupId).trim();

    if (!this.admins.has(id)) {
      this.admins.set(id, new Set());
    }

    return this.admins.get(id);
  }

  /**
   * Adds a user to the group's admin list.
   */
  add(groupId, userId) {
    if (!groupId || !userId) return false;
    const admins = this.ensureGroup(groupId);
    admins.add(String(userId).trim());
    return true;
  }

  /**
   * Removes a user from the group's admin list.
   */
  remove(groupId, userId) {
    if (!groupId || !userId) return false;
    const admins = this.ensureGroup(groupId);
    return admins.delete(String(userId).trim());
  }

  /**
   * Checks if a specific user is an admin in the given group.
   */
  isAdmin(groupId, userId) {
    if (!groupId || !userId) return false;
    return this.ensureGroup(groupId).has(String(userId).trim());
  }

  /**
   * Returns an array of all admin user IDs for a group.
   */
  list(groupId) {
    if (!groupId) return [];
    return Array.from(this.ensureGroup(groupId));
  }

  /**
   * Clears all stored admin data from memory.
   */
  clear() {
    this.admins.clear();
  }
}

export default GroupAdminStore;
