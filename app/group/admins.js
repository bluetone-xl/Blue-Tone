class GroupAdminStore {
  constructor() {
    this.admins = new Map();
  }

  ensureGroup(groupId) {
    const id = String(groupId);

    if (!this.admins.has(id)) {
      this.admins.set(id, new Set());
    }

    return this.admins.get(id);
  }

  add(groupId, userId) {
    const admins = this.ensureGroup(groupId);
    admins.add(String(userId));

    return true;
  }

  remove(groupId, userId) {
    const admins = this.ensureGroup(groupId);
    return admins.delete(String(userId));
  }

  isAdmin(groupId, userId) {
    return this.ensureGroup(groupId).has(String(userId));
  }

  list(groupId) {
    return Array.from(this.ensureGroup(groupId));
  }
}

module.exports = GroupAdminStore;
