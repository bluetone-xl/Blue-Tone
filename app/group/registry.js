class GroupRegistry {
  constructor() {
    this.groups = new Map();
  }

  register(group) {
    if (!group || !group.id) {
      throw new Error('Valid group is required');
    }

    const id = String(group.id);

    this.groups.set(id, group);

    return group;
  }

  get(groupId) {
    return this.groups.get(String(groupId)) || null;
  }

  remove(groupId) {
    return this.groups.delete(String(groupId));
  }

  list() {
    return Array.from(this.groups.values());
  }

  count() {
    return this.groups.size;
  }

  getManagementGroup() {
    return this.list().find(group => group.isManagementGroup) || null;
  }

  setManagementGroup(groupId) {
    const id = String(groupId);

    for (const group of this.groups.values()) {
      group.isManagementGroup = group.id === id;
    }

    return this.get(id);
  }
}

module.exports = GroupRegistry;
