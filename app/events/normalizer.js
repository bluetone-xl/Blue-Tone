const EVENT_TYPES = Object.freeze({
  MESSAGE: 'message',
  MEMBER_JOIN: 'member_join',
  MEMBER_LEAVE: 'member_leave',
  MEMBER_REMOVE: 'member_remove',
  MEMBER_APPROVAL: 'member_approval',
  REACTION: 'reaction'
});

function normalizeEvent(input = {}) {
  return {
    type: input.type || null,
    groupId: input.groupId ? String(input.groupId) : null,
    senderUid: input.senderUid ? String(input.senderUid) : null,
    targetUid: input.targetUid ? String(input.targetUid) : null,
    messageId: input.messageId ? String(input.messageId) : null,
    text: typeof input.text === 'string' ? input.text : '',
    timestamp: input.timestamp || new Date().toISOString(),
    raw: input.raw || null
  };
}

function isKnownEventType(type) {
  return Object.values(EVENT_TYPES).includes(type);
}

module.exports = {
  EVENT_TYPES,
  normalizeEvent,
  isKnownEventType
};
