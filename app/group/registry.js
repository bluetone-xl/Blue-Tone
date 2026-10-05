/**
 * In-memory registry for managing active Group model instances and management flags.
 */
export class GroupRegistry {
  constructor() {
    this.groups = new Map();
  }

  /**
   * Registers or updates a Group instance in memory.
   */
  register(group) {
    if (!group || !group.id) {
      throw new Error('Valid group instance with a valid ID is required');
    }

    const id = String(group.id).trim();
    this.groups.set(id, group);

    return group;
  }

  /**
   * Retrieves a registered group by ID.
   */
  get(groupId) {
    if (!groupId) return null;
    return this.groups.get(String(groupId).trim()) || null;
  }

  /**
   * Removes a group from the registry.
   */
  remove(groupId) {
    if (!groupId) return false;
    return this.groups.delete(String(groupId).trim());
  }

  /**
   * Lists all registered groups.
   */
  list() {
    return Array.from(this.groups.values());
  }

  /**
   * Returns total registered group count.
   */
  count() {
    return this.groups.size;
  }

  /**
   * Finds and returns the primary designated management group.
   */
  getManagementGroup() {
    return this.list().find((group) => Boolean(group?.isManagementGroup)) || null;
  }

  /**
   * Designates a specific group as the management group while resetting others.
   */
  setManagementGroup(groupId) {
    if (!groupId) return null;
    const targetId = String(groupId).trim();

    for (const group of this.groups.values()) {
      group.isManagementGroup = group.id === targetId;
    }

    return this.get(targetId);
  }

  /**
   * Clears all groups from the registry.
   */
  clear() {
    this.groups.clear();
  }
}

export default GroupRegistry;
