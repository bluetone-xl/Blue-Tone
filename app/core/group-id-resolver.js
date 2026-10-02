function normalizeGroupId(groupId) {
  if (groupId === null || groupId === undefined || groupId === '') {
    return null;
  }

  return String(groupId);
}

function resolveGroupId(context = {}) {
  return normalizeGroupId(
    context.groupId ||
    context.threadId ||
    context.conversationId
  );
}

module.exports = {
  normalizeGroupId,
  resolveGroupId
};
