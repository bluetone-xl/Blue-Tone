import { getRole, ROLES } from './roles.js';

const ROLE_LEVEL = Object.freeze({
  [ROLES?.MEMBER || 'member']: 1,
  [ROLES?.GROUP_ADMIN || 'admin']: 2,
  [ROLES?.OWNER || 'owner']: 3
});

/**
 * Checks whether a user has the required permission level.
 * @param {string|number} uid 
 * @param {Array} groupAdmins 
 * @param {string} requiredRole 
 * @returns {Object} Result object containing allowed flag, actual role, and required role.
 */
export function canExecute(uid, groupAdmins = [], requiredRole = 'member') {
  try {
    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const role = getRole(uid, safeAdmins) || 'member';

    const normalizedRole = String(role).trim().toLowerCase();
    const normalizedRequiredRole = String(requiredRole || 'member').trim().toLowerCase();

    const userLevel = ROLE_LEVEL[normalizedRole] || 1;
    const requiredLevel = ROLE_LEVEL[normalizedRequiredRole] || 1;

    return {
      allowed: userLevel >= requiredLevel,
      role: normalizedRole,
      requiredRole: normalizedRequiredRole
    };
  } catch (err) {
    console.error('❌ [PermissionGuard] Error in canExecute:', err.message);
    return {
      allowed: false,
      role: 'member',
      requiredRole: String(requiredRole || 'member').trim().toLowerCase()
    };
  }
}

/**
 * Asserts permission and throws an error if authorization fails.
 * @param {string|number} uid 
 * @param {Array} groupAdmins 
 * @param {string} requiredRole 
 * @returns {Object}
 */
export function assertPermission(uid, groupAdmins = [], requiredRole = 'member') {
  try {
    const result = canExecute(uid, groupAdmins, requiredRole);

    if (!result.allowed) {
      const error = new Error('Permission denied');
      error.code = 'PERMISSION_DENIED';
      error.role = result.role;
      error.requiredRole = result.requiredRole;
      throw error;
    }

    return result;
  } catch (err) {
    if (err.code === 'PERMISSION_DENIED') {
      throw err;
    }
    console.error('❌ [PermissionGuard] Unexpected error in assertPermission:', err.message);
    const fallbackError = new Error('Permission denied due to internal authorization error');
    fallbackError.code = 'PERMISSION_DENIED';
    fallbackError.role = 'unknown';
    fallbackError.requiredRole = requiredRole;
    throw fallbackError;
  }
}

export default {
  canExecute,
  assertPermission
};
