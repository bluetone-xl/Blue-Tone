/**
 * ExtensionEventNormalizer standardizes raw extension event pay-loads.
 */
export class ExtensionEventNormalizer {
  /**
   * Normalizes raw event objects into a consistent shape.
   * @param {Object} event 
   * @returns {Object|null}
   */
  normalize(event) {
    try {
      if (!event || typeof event !== 'object') {
        console.warn('⚠️ [ExtensionNormalizer] Received invalid or null extension event.');
        return null;
      }

      const rawType = event.type || event.event || '';
      const type = String(rawType).trim();

      if (!type) {
        console.warn('⚠️ [ExtensionNormalizer] Extension event missing required "type" field.');
        return null;
      }

      const groupId = event.groupId ?? event.threadId ?? null;
      const senderUid = event.senderUid ?? event.userId ?? event.authorId ?? null;
      const targetUid = event.targetUid ?? event.mentionedUid ?? event.repliedUserUid ?? null;
      const messageId = event.messageId ?? event.id ?? null;
      const text = event.text ?? event.message ?? '';

      return {
        source: 'extension',
        type,
        groupId: groupId ? String(groupId).trim() : null,
        senderUid: senderUid ? String(senderUid).trim() : null,
        targetUid: targetUid ? String(targetUid).trim() : null,
        messageId: messageId ? String(messageId).trim() : null,
        text: typeof text === 'string' ? text.trim() : String(text || ''),
        raw: event
      };
    } catch (err) {
      console.error('❌ [ExtensionNormalizer] Error normalizing extension event:', err.message);
      return null;
    }
  }
}

export default ExtensionEventNormalizer;
