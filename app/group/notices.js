const DEFAULT_NOTICES = Object.freeze({
  welcome: {
    enabled: true,
    template: 'Welcome, {user}! 🎉'
  },

  leave: {
    enabled: true,
    template: '{user} has left the group.'
  },

  remove: {
    enabled: true,
    template: '{user} has been removed from the group.'
  }
});

class NoticeStore {
  constructor() {
    this.groups = new Map();
  }

  ensureGroup(groupId) {
    const id = String(groupId);

    if (!this.groups.has(id)) {
      this.groups.set(id, {
        welcome: { ...DEFAULT_NOTICES.welcome },
        leave: { ...DEFAULT_NOTICES.leave },
        remove: { ...DEFAULT_NOTICES.remove }
      });
    }

    return this.groups.get(id);
  }

  get(groupId, type) {
    const settings = this.ensureGroup(groupId);
    return settings[String(type)] || null;
  }

  setEnabled(groupId, type, enabled) {
    const notice = this.get(groupId, type);

    if (!notice) {
      throw new Error('Unknown notice type');
    }

    notice.enabled = Boolean(enabled);
    return notice;
  }

  setTemplate(groupId, type, template) {
    const notice = this.get(groupId, type);

    if (!notice) {
      throw new Error('Unknown notice type');
    }

    notice.template = String(template);
    return notice;
  }

  all(groupId) {
    return this.ensureGroup(groupId);
  }
}

module.exports = {
  DEFAULT_NOTICES,
  NoticeStore
};
