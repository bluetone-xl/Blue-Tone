const DEFAULT_REACTIONS = Object.freeze([
  '❤️',
  '😂',
  '👍',
  '😢',
  '😮',
  '😡',
  '🎉'
]);

class ReactionSettings {
  constructor() {
    this.groups = new Map();
  }

  ensureGroup(groupId) {
    const id = String(groupId);

    if (!this.groups.has(id)) {
      this.groups.set(id, {
        enabled: false,
        reactions: [...DEFAULT_REACTIONS]
      });
    }

    return this.groups.get(id);
  }

  get(groupId) {
    return this.ensureGroup(groupId);
  }

  setEnabled(groupId, enabled) {
    const settings = this.ensureGroup(groupId);
    settings.enabled = Boolean(enabled);

    return settings;
  }

  setReactions(groupId, reactions) {
    if (!Array.isArray(reactions) || reactions.length === 0) {
      throw new Error('At least one reaction is required');
    }

    const settings = this.ensureGroup(groupId);

    settings.reactions = [...new Set(reactions.map(String))];

    return settings;
  }
}

module.exports = {
  DEFAULT_REACTIONS,
  ReactionSettings
};
