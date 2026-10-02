class Group {
  constructor({
    id,
    name = '',
    isManagementGroup = false,
    active = true
  }) {
    if (!id) {
      throw new Error('Group ID is required');
    }

    this.id = String(id);
    this.name = name;
    this.isManagementGroup = Boolean(isManagementGroup);
    this.active = Boolean(active);
  }
}

module.exports = Group;
