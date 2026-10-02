class MemberStore {
  constructor() {
    this.members = new Map();
    this.pending = new Map();
  }

  key(groupId, userId) {
    return `${String(groupId)}:${String(userId)}`;
  }

  add(groupId, userId, data = {}) {
    const key = this.key(groupId, userId);

    const member = {
      groupId: String(groupId),
      userId: String(userId),
      status: 'active',
      nickname: data.nickname || '',
      joinedAt: data.joinedAt || new Date().toISOString()
    };

    this.members.set(key, member);
    this.pending.delete(key);

    return member;
  }

  remove(groupId, userId) {
    const key = this.key(groupId, userId);
    const member = this.members.get(key);

    if (!member) return false;

    member.status = 'removed';
    this.members.set(key, member);

    return true;
  }

  get(groupId, userId) {
    return this.members.get(this.key(groupId, userId)) || null;
  }

  requestApproval(groupId, userId, data = {}) {
    const key = this.key(groupId, userId);

    const request = {
      groupId: String(groupId),
      userId: String(userId),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      ...data
    };

    this.pending.set(key, request);

    return request;
  }

  approve(groupId, userId, data = {}) {
    const request = this.pending.get(this.key(groupId, userId));

    return this.add(groupId, userId, {
      ...data,
      nickname: request?.nickname || data.nickname || ''
    });
  }

  getPending(groupId) {
    const result = [];

    for (const request of this.pending.values()) {
      if (request.groupId === String(groupId)) {
        result.push(request);
      }
    }

    return result;
  }
}

module.exports = MemberStore;
