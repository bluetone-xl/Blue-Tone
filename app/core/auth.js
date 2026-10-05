/**
 * Checks if the given sender ID matches the Bot Owner UID.
 * @param {string|number} senderId 
 * @returns {boolean}
 */
export function isBotOwner(senderId) {
  try {
    if (!senderId) return false;
    
    const ownerUid = (process.env.BOT_OWNER_UID || '61594424694266').trim();
    return String(senderId).trim() === ownerUid;
  } catch (err) {
    console.error('❌ [AuthCore] Error in isBotOwner check:', err.message);
    return false;
  }
}

/**
 * Checks if the sender has administrative or elevated permissions in a group.
 * @param {string} senderRole 
 * @param {string|number} senderId 
 * @returns {boolean}
 */
export function isGroupAdmin(senderRole, senderId) {
  try {
    // Bot owner bypasses group admin restrictions
    if (isBotOwner(senderId)) return true;

    if (!senderRole) return false;

    const normalizedRole = String(senderRole).trim().toLowerCase();
    const adminRoles = ['admin', 'moderator', 'owner'];

    return adminRoles.includes(normalizedRole);
  } catch (err) {
    console.error('❌ [AuthCore] Error in isGroupAdmin check:', err.message);
    return false;
  }
}

export default { isBotOwner, isGroupAdmin };
