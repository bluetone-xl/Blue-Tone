/**
 * Normalizes and sanitizes a group ID string.
 * @param {string|number|null|undefined} groupId 
 * @returns {string|null}
 */
export function normalizeGroupId(groupId) {
  try {
    if (groupId === null || groupId === undefined || groupId === '') {
      return null;
    }

    const strId = String(groupId).trim();
    return strId.length > 0 ? strId : null;
  } catch (err) {
    console.error('❌ [GroupIdResolver] Error normalizing group ID:', err.message);
    return null;
  }
}

/**
 * Resolves the valid group ID from various potential context properties.
 * @param {Object} context 
 * @returns {string|null}
 */
export function resolveGroupId(context = {}) {
  try {
    if (!context || typeof context !== 'object') {
      return null;
    }

    const rawId = context.groupId || context.threadId || context.conversationId;
    return normalizeGroupId(rawId);
  } catch (err) {
    console.error('❌ [GroupIdResolver] Error resolving group ID:', err.message);
    return null;
  }
}

export default {
  normalizeGroupId,
  resolveGroupId
};
