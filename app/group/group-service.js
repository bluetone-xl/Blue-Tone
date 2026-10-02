export class GroupService {
  constructor() {
    this.groups = new Map();
    this.admins = {
      list: async (groupId) => []
    };
    this.warnings = {};
  }

  getGroup(groupId) {
    return this.groups.get(groupId) || null;
  }

  getSettings(groupId) {
    return { prefix: '!' };
  }
}

export default GroupService;
