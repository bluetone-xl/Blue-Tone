const config = require('./config');

function isOwner(uid) {
  if (!uid || !config.botOwnerUid) return false;
  return String(uid) === String(config.botOwnerUid);
}

function roleFor(uid, groupAdmins = []) {
  if (isOwner(uid)) return 'owner';

  const isAdmin = groupAdmins.some(
    adminUid => String(adminUid) === String(uid)
  );

  return isAdmin ? 'group_admin' : 'member';
}

module.exports = {
  isOwner,
  roleFor
};
