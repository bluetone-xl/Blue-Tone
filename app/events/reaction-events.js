/**
 * Handles incoming message reactions and emojis.
 */
export class ReactionEventHandler {
  /**
   * Processes reaction payloads safely.
   * @param {Object} [data={}] 
   * @returns {Promise<Object>}
   */
  async handleReaction(data = {}) {
    try {
      const messageId = data?.messageId ?? data?.messageID ?? null;
      const reaction = data?.reaction ?? data?.emoji ?? null;
      const senderUid = data?.senderUid ?? data?.userID ?? null;
      const groupId = data?.groupId ?? data?.threadID ?? null;

      if (!messageId || !reaction) {
        return { status: 'IGNORED_INVALID_REACTION' };
      }

      return {
        status: 'PROCESSED_REACTION',
        data: {
          messageId: String(messageId).trim(),
          reaction: String(reaction).trim(),
          senderUid: senderUid ? String(senderUid).trim() : null,
          groupId: groupId ? String(groupId).trim() : null
        }
      };
    } catch (err) {
      console.error('❌ [ReactionEventHandler] Error handling reaction:', err.message);
      return { status: 'ERROR', error: err.message };
    }
  }
}

export default ReactionEventHandler;
