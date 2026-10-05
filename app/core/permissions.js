import config from './config.js';

/**
 * Checks whether the given user ID matches the Bot Owner UID.
 * @param {string|number} uid 
 * @returns {boolean}
 */
export function isOwner(uid) {
  try {
    if (!uid) return false;
    const ownerUid = config?.botOwnerUid || process.env.BOT_OWNER_UID || '';
    if (!ownerUid) return false;

    return String(uid).trim() === String(ownerUid).trim();
  } catch (err) {
    console.error('❌ [PermissionCore] Error in isOwner check:', err.message);
    return false;
  }
}

/**
 * Determines the role of a user within a group context.
 * @param {string|number} uid 
 * @param {Array} [groupAdmins=[]] 
 * @returns {string} 'owner' | 'group_admin' | 'member'
 */
export function roleFor(uid, groupAdmins = []) {
  try {
    if (!uid) return 'member';

    const safeUid = String(uid).trim();
    if (isOwner(safeUid)) return 'owner';

    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const isAdmin = safeAdmins.some(adminUid => String(adminUid).trim() === safeUid);

    return isAdmin ? 'group_admin' : 'member';
  } catch (err) {
    console.error('❌ [PermissionCore] Error in roleFor check:', err.message);
    return 'member';
  }
}

export default {
  isOwner,
  roleFor
};
