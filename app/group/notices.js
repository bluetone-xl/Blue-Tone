/**
 * Default notice configurations for group events.
 */
export const DEFAULT_NOTICES = Object.freeze({
  welcome: Object.freeze({
    enabled: true,
    template: 'Welcome, {user}! 🎉'
  }),
  leave: Object.freeze({
    enabled: true,
    template: '{user} has left the group.'
  }),
  remove: Object.freeze({
    enabled: true,
    template: '{user} has been removed from the group.'
  })
});

/**
 * In-memory store for group notice and announcement templates.
 */
export class NoticeStore {
  constructor() {
    this.groups = new Map();
  }

  /**
   * Ensures default notice configurations exist for a target group.
   */
  ensureGroup(groupId) {
    if (!groupId) return null;
    const id = String(groupId).trim();

    if (!this.groups.has(id)) {
      this.groups.set(id, {
        welcome: { ...DEFAULT_NOTICES.welcome },
        leave: { ...DEFAULT_NOTICES.leave },
        remove: { ...DEFAULT_NOTICES.remove }
      });
    }

    return this.groups.get(id);
  }

  /**
   * Retrieves a specific notice type for a group.
   */
  get(groupId, type) {
    if (!groupId || !type) return null;
    const settings = this.ensureGroup(groupId);
    return settings?.[String(type).trim()] || null;
  }

  /**
   * Enables or disables a specific notice type for a group.
   */
  setEnabled(groupId, type, enabled) {
    const notice = this.get(groupId, type);

    if (!notice) {
      throw new Error(`Unknown or invalid notice type: "${type}"`);
    }

    notice.enabled = Boolean(enabled);
    return notice;
  }

  /**
   * Updates the notice template message for a specific type.
   */
  setTemplate(groupId, type, template) {
    const notice = this.get(groupId, type);

    if (!notice) {
      throw new Error(`Unknown or invalid notice type: "${type}"`);
    }

    notice.template = String(template || '');
    return notice;
  }

  /**
   * Returns all notice configurations for a group.
   */
  all(groupId) {
    if (!groupId) return null;
    return this.ensureGroup(groupId);
  }

  /**
   * Clears stored group notice memory.
   */
  clear() {
    this.groups.clear();
  }
}

export default NoticeStore;
