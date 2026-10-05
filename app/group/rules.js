/**
 * Model representing group rules and guidelines.
 */
export class GroupRules {
  constructor(groupId, rules = '') {
    if (!groupId) {
      throw new Error('Group ID is required to initialize GroupRules');
    }

    this.groupId = String(groupId).trim();
    this.rules = rules ? String(rules).trim() : '';
    this.updatedAt = new Date();
  }

  /**
   * Updates the rules text for the group.
   */
  setRules(rules) {
    this.rules = rules ? String(rules).trim() : '';
    this.updatedAt = new Date();
    return this.rules;
  }

  /**
   * Retrieves the current group rules.
   */
  getRules() {
    return this.rules;
  }

  /**
   * Checks if rules have been configured.
   */
  hasRules() {
    return Boolean(this.rules && this.rules.length > 0);
  }

  /**
   * Clears stored group rules.
   */
  clear() {
    this.rules = '';
    this.updatedAt = new Date();
  }
}

export default GroupRules;
