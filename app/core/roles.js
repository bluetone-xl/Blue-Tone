import { isOwner } from './permission.js';

export const ROLES = Object.freeze({
  OWNER: 'owner',
  GROUP_ADMIN: 'group_admin',
  MEMBER: 'member'
});

/**
 * Resolves the system role of a user based on their UID and group admin status.
 * @param {string|number} uid 
 * @param {Array} [groupAdmins=[]] 
 * @returns {string} One of ROLES values
 */
export function getRole(uid, groupAdmins = []) {
  try {
    if (!uid) return ROLES.MEMBER;

    const safeUid = String(uid).trim();
    if (!safeUid) return ROLES.MEMBER;

    if (isOwner(safeUid)) {
      return ROLES.OWNER;
    }

    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const adminSet = new Set(safeAdmins.map(admin => String(admin).trim()));

    if (adminSet.has(safeUid)) {
      return ROLES.GROUP_ADMIN;
    }

    return ROLES.MEMBER;
  } catch (err) {
    console.error('❌ [RolesCore] Error resolving user role:', err.message);
    return ROLES.MEMBER;
  }
}

/**
 * Checks if a role has group management permissions.
 * @param {string} role 
 * @returns {boolean}
 */
export function canManageGroup(role) {
  try {
    if (!role) return false;
    const normalizedRole = String(role).trim().toLowerCase();
    return normalizedRole === ROLES.OWNER || normalizedRole === ROLES.GROUP_ADMIN;
  } catch (err) {
    console.error('❌ [RolesCore] Error in canManageGroup check:', err.message);
    return false;
  }
}

/**
 * Checks if a role has global bot management permissions.
 * @param {string} role 
 * @returns {boolean}
 */
export function canManageBot(role) {
  try {
    if (!role) return false;
    const normalizedRole = String(role).trim().toLowerCase();
    return normalizedRole === ROLES.OWNER;
  } catch (err) {
    console.error('❌ [RolesCore] Error in canManageBot check:', err.message);
    return false;
  }
}

export default {
  ROLES,
  getRole,
  canManageGroup,
  canManageBot
};
