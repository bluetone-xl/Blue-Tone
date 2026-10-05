/**
 * Audit Log system for tracking administrative and bot operations.
 */
export class AuditLog {
  constructor() {
    this.entries = [];
  }

  /**
   * Adds a new entry to the audit log.
   * @param {Object} params
   * @returns {Object} Log entry
   */
  add({
    actorUid,
    groupId = null,
    action,
    targetUid = null,
    details = {}
  } = {}) {
    try {
      if (!actorUid || !action) {
        throw new Error('actorUid and action are required parameters.');
      }

      const entry = {
        id: `${Date.now()}-${this.entries.length + 1}`,
        actorUid: String(actorUid).trim(),
        groupId: groupId ? String(groupId).trim() : null,
        action: String(action).trim(),
        targetUid: targetUid ? String(targetUid).trim() : null,
        details: typeof details === 'object' && details !== null ? details : {},
        createdAt: new Date().toISOString()
      };

      this.entries.push(entry);
      return entry;
    } catch (err) {
      console.error('❌ [AuditLog] Failed to add audit entry:', err.message);
      throw err;
    }
  }

  /**
   * Retrieves a filtered list of log entries.
   * @param {Object} params
   * @returns {Array} Array of matched log entries
   */
  list({ groupId = null, actorUid = null, limit = 100 } = {}) {
    try {
      let result = this.entries;

      if (groupId) {
        const targetGroup = String(groupId).trim();
        result = result.filter(entry => entry.groupId === targetGroup);
      }

      if (actorUid) {
        const targetActor = String(actorUid).trim();
        result = result.filter(entry => entry.actorUid === targetActor);
      }

      const safeLimit = Math.max(1, Number(limit) || 100);
      return result.slice(-safeLimit);
    } catch (err) {
      console.error('❌ [AuditLog] Failed to list audit entries:', err.message);
      return [];
    }
  }
}

export default AuditLog;
