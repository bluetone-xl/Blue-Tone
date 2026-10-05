/**
 * Normalizes and sanitizes a UID value.
 * @param {string|number|null|undefined} uid 
 * @returns {string|null}
 */
export function normalizeUid(uid) {
  try {
    if (uid === null || uid === undefined || uid === '') {
      return null;
    }

    const strUid = String(uid).trim();
    return strUid.length > 0 ? strUid : null;
  } catch (err) {
    console.error('❌ [UidResolver] Error normalizing UID:', err.message);
    return null;
  }
}

/**
 * Resolves target UID from mentioned, replied, or sender UIDs in priority order.
 * @param {Object} params
 * @returns {string|null}
 */
export function resolveUid({ senderUid = null, mentionedUid = null, repliedUserUid = null } = {}) {
  try {
    const targetUid =
      normalizeUid(mentionedUid) ||
      normalizeUid(repliedUserUid) ||
      normalizeUid(senderUid);

    return targetUid;
  } catch (err) {
    console.error('❌ [UidResolver] Error resolving target UID:', err.message);
    return normalizeUid(senderUid);
  }
}

export default {
  normalizeUid,
  resolveUid
};
