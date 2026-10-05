/**
 * Data model representing a Facebook group entity.
 */
export class Group {
  constructor({
    id,
    name = '',
    isManagementGroup = false,
    active = true
  } = {}) {
    if (!id) {
      throw new Error('Group ID is required to instantiate Group model');
    }

    this.id = String(id).trim();
    this.name = name ? String(name).trim() : '';
    this.isManagementGroup = Boolean(isManagementGroup);
    this.active = Boolean(active);
    this.createdAt = new Date();
  }

  /**
   * Returns a plain object representation of the group model.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      isManagementGroup: this.isManagementGroup,
      active: this.active,
      createdAt: this.createdAt
    };
  }
}

export default Group;
