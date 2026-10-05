/**
 * In-memory store for managing group members, pending approval requests, and membership statuses.
 */
export class MemberStore {
  constructor() {
    this.members = new Map();
    this.pending = new Map();
  }

  /**
   * Generates a composite key for group-user lookup.
   */
  _key(groupId, userId) {
    return `${String(groupId).trim()}:${String(userId).trim()}`;
  }

  /**
   * Adds or updates an active member in a group.
   */
  add(groupId, userId, data = {}) {
    if (!groupId || !userId) return null;

    const key = this._key(groupId, userId);
    const member = {
      groupId: String(groupId).trim(),
      userId: String(userId).trim(),
      status: 'active',
      nickname: data.nickname ? String(data.nickname).trim() : '',
      joinedAt: data.joinedAt || new Date().toISOString()
    };

    this.members.set(key, member);
    this.pending.delete(key);

    return member;
  }

  /**
   * Marks a member as removed from the group.
   */
  remove(groupId, userId) {
    if (!groupId || !userId) return false;

    const key = this._key(groupId, userId);
    const member = this.members.get(key);

    if (!member) return false;

    member.status = 'removed';
    member.removedAt = new Date().toISOString();
    this.members.set(key, member);

    return true;
  }

  /**
   * Retrieves a stored member record.
   */
  get(groupId, userId) {
    if (!groupId || !userId) return null;
    return this.members.get(this._key(groupId, userId)) || null;
  }

  /**
   * Registers a pending membership request.
   */
  requestApproval(groupId, userId, data = {}) {
    if (!groupId || !userId) return null;

    const key = this._key(groupId, userId);
    const request = {
      groupId: String(groupId).trim(),
      userId: String(userId).trim(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      ...data
    };

    this.pending.set(key, request);
    return request;
  }

  /**
   * Approves a pending request and converts it into an active member.
   */
  approve(groupId, userId, data = {}) {
    if (!groupId || !userId) return null;

    const key = this._key(groupId, userId);
    const request = this.pending.get(key);

    return this.add(groupId, userId, {
      ...data,
      nickname: request?.nickname || data.nickname || ''
    });
  }

  /**
   * Lists all pending member approval requests for a group.
   */
  getPending(groupId) {
    if (!groupId) return [];

    const targetGroupId = String(groupId).trim();
    const result = [];

    for (const request of this.pending.values()) {
      if (request.groupId === targetGroupId) {
        result.push(request);
      }
    }

    return result;
  }

  /**
   * Clears all cached member data.
   */
  clear() {
    this.members.clear();
    this.pending.clear();
  }
}

export default MemberStore;
