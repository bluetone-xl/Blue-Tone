const { isOwner } = require('./permissions');

const ROLES = Object.freeze({
  OWNER: 'owner',
  GROUP_ADMIN: 'group_admin',
  MEMBER: 'member'
});

function getRole(uid, groupAdmins = []) {
  if (isOwner(uid)) return ROLES.OWNER;

  const admins = new Set(groupAdmins.map(String));

  if (admins.has(String(uid))) {
    return ROLES.GROUP_ADMIN;
  }

  return ROLES.MEMBER;
}

function canManageGroup(role) {
  return role === ROLES.OWNER || role === ROLES.GROUP_ADMIN;
}

function canManageBot(role) {
  return role === ROLES.OWNER;
}

module.exports = {
  ROLES,
  getRole,
  canManageGroup,
  canManageBot
};
