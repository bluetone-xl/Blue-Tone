const { getRole, ROLES } = require('./roles');

const ROLE_LEVEL = Object.freeze({
  [ROLES.MEMBER]: 1,
  [ROLES.GROUP_ADMIN]: 2,
  [ROLES.OWNER]: 3
});

function canExecute(uid, groupAdmins, requiredRole) {
  const role = getRole(uid, groupAdmins);

  const userLevel = ROLE_LEVEL[role] || 0;
  const requiredLevel = ROLE_LEVEL[requiredRole] || 0;

  return {
    allowed: userLevel >= requiredLevel,
    role,
    requiredRole
  };
}

function assertPermission(uid, groupAdmins, requiredRole) {
  const result = canExecute(uid, groupAdmins, requiredRole);

  if (!result.allowed) {
    const error = new Error('Permission denied');
    error.code = 'PERMISSION_DENIED';
    error.role = result.role;
    error.requiredRole = requiredRole;
    throw error;
  }

  return result;
}

module.exports = {
  canExecute,
  assertPermission
};
