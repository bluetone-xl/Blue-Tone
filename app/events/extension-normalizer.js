class ExtensionEventNormalizer {
  normalize(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Invalid extension event');
    }

    const type = String(event.type || event.event || '').trim();

    if (!type) {
      throw new Error('Event type is required');
    }

    return {
      source: 'extension',
      type,
      groupId: event.groupId ?? event.threadId ?? null,
      senderUid: event.senderUid ?? event.userId ?? event.authorId ?? null,
      targetUid: event.targetUid ?? event.mentionedUid ?? event.repliedUserUid ?? null,
      messageId: event.messageId ?? event.id ?? null,
      text: event.text ?? event.message ?? '',
      raw: event
    };
  }
}

module.exports = ExtensionEventNormalizer;
