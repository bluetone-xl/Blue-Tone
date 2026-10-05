/**
 * Event type definitions for the event pipeline.
 */
export const EVENT_TYPES = Object.freeze({
  MESSAGE: 'message',
  MEMBER_JOIN: 'member_join',
  MEMBER_LEAVE: 'member_leave',
  MEMBER_REMOVE: 'member_remove',
  MEMBER_APPROVAL: 'member_approval',
  REACTION: 'reaction'
});

/**
 * Normalizes generic event inputs into a standardized schema.
 * @param {Object} [input={}] 
 * @returns {Object}
 */
export function normalizeEvent(input = {}) {
  try {
    const safeInput = typeof input === 'object' && input !== null ? input : {};

    const rawType = safeInput.type || safeInput.event || null;
    const type = rawType ? String(rawType).trim().toLowerCase() : null;

    const groupId = safeInput.groupId ?? safeInput.threadId ?? null;
    const senderUid = safeInput.senderUid ?? safeInput.userId ?? safeInput.authorId ?? null;
    const targetUid = safeInput.targetUid ?? safeInput.mentionedUid ?? safeInput.repliedUserUid ?? null;
    const messageId = safeInput.messageId ?? safeInput.id ?? null;
    const text = typeof safeInput.text === 'string' ? safeInput.text : String(safeInput.text || '');

    return {
      type,
      groupId: groupId ? String(groupId).trim() : null,
      senderUid: senderUid ? String(senderUid).trim() : null,
      targetUid: targetUid ? String(targetUid).trim() : null,
      messageId: messageId ? String(messageId).trim() : null,
      text,
      timestamp: safeInput.timestamp || new Date().toISOString(),
      raw: safeInput.raw || safeInput
    };
  } catch (err) {
    console.error('❌ [EventNormalizer] Error normalizing event:', err.message);
    return {
      type: null,
      groupId: null,
      senderUid: null,
      targetUid: null,
      messageId: null,
      text: '',
      timestamp: new Date().toISOString(),
      raw: input
    };
  }
}

/**
 * Validates whether an event type is recognized by the system.
 * @param {string} type 
 * @returns {boolean}
 */
export function isKnownEventType(type) {
  try {
    if (!type) return false;
    const safeType = String(type).trim().toLowerCase();
    return Object.values(EVENT_TYPES).includes(safeType);
  } catch (err) {
    console.error('❌ [EventNormalizer] Error validating event type:', err.message);
    return false;
  }
}

export default {
  EVENT_TYPES,
  normalizeEvent,
  isKnownEventType
};
