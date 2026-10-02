class AuditLog {
  constructor() {
    this.entries = [];
  }

  add({
    actorUid,
    groupId = null,
    action,
    targetUid = null,
    details = {}
  } = {}) {
    if (!actorUid || !action) {
      throw new Error('actorUid and action are required');
    }

    const entry = {
      id: `${Date.now()}-${this.entries.length + 1}`,
      actorUid: String(actorUid),
      groupId: groupId ? String(groupId) : null,
      action: String(action),
      targetUid: targetUid ? String(targetUid) : null,
      details,
      createdAt: new Date().toISOString()
    };

    this.entries.push(entry);

    return entry;
  }

  list({ groupId = null, actorUid = null, limit = 100 } = {}) {
    let result = this.entries;

    if (groupId) {
      result = result.filter(
        entry => entry.groupId === String(groupId)
      );
    }

    if (actorUid) {
      result = result.filter(
        entry => entry.actorUid === String(actorUid)
      );
    }

    return result.slice(-Number(limit));
  }
}

module.exports = AuditLog;
