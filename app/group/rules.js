class GroupRules {
  constructor(groupId, rules = '') {
    if (!groupId) {
      throw new Error('Group ID is required');
    }

    this.groupId = String(groupId);
    this.rules = String(rules);
  }

  setRules(rules) {
    this.rules = String(rules);
    return this.rules;
  }

  getRules() {
    return this.rules;
  }
}

module.exports = GroupRules;
