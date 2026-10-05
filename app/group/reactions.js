/**
 * Custom reaction presets as specified.
 */
export const DEFAULT_REACTIONS = Object.freeze([
  '🍒', '🫦', '😹', '🙀', '😿', '🙈'
]);

/**
 * Status and operational indicator emojis.
 */
export const STATUS_EMOJIS = Object.freeze({
  done: '✅',
  notAllowed: '❎',
  processing: '⏳',
  okay: '🆗'
});

/**
 * In-memory store for group reaction configurations.
 */
export class ReactionSettings {
  constructor() {
    this.groups = new Map();
  }

  /**
   * Ensures reaction settings exist for a target group.
   */
  ensureGroup(groupId) {
    if (!groupId) return null;
    const id = String(groupId).trim();

    if (!this.groups.has(id)) {
      this.groups.set(id, {
        enabled: true,
        reactions: [...DEFAULT_REACTIONS]
      });
    }

    return this.groups.get(id);
  }

  /**
   * Retrieves reaction settings for a specific group.
   */
  get(groupId) {
    if (!groupId) return null;
    return this.ensureGroup(groupId);
  }

  /**
   * Enables or disables reaction features for a group.
   */
  setEnabled(groupId, enabled) {
    const settings = this.ensureGroup(groupId);
    if (!settings) return null;

    settings.enabled = Boolean(enabled);
    return settings;
  }

  /**
   * Sets custom reaction emojis for a group.
   */
  setReactions(groupId, reactions) {
    if (!Array.isArray(reactions) || reactions.length === 0) {
      throw new Error('At least one reaction emoji is required');
    }

    const settings = this.ensureGroup(groupId);
    if (!settings) return null;

    // Filter, stringify, and remove duplicates
    settings.reactions = [...new Set(reactions.map((r) => String(r).trim()).filter(Boolean))];

    return settings;
  }

  /**
   * Clears stored reaction memory.
   */
  clear() {
    this.groups.clear();
  }
}

export default ReactionSettings;
