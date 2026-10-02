const { getRole } = require('./roles');
const { resolveGroupId } = require('./group-id-resolver');

function createCommandContext({
  senderUid,
  groupId,
  groupAdmins = [],
  command = '',
  args = [],
  raw = '',
  isManagementGroup = false,
  selectedGroupId = null,
  targetUid = null
} = {}) {
  const resolvedGroupId = resolveGroupId({ groupId });
  const role = getRole(senderUid, groupAdmins);

  return {
    senderUid: senderUid ? String(senderUid) : null,
    targetUid: targetUid ? String(targetUid) : null,
    groupId: resolvedGroupId,
    role,
    command: String(command).toLowerCase(),
    args: Array.isArray(args) ? args : [],
    raw: String(raw),
    isManagementGroup: Boolean(isManagementGroup),
    selectedGroupId: selectedGroupId
      ? String(selectedGroupId)
      : null
  };
}

module.exports = {
  createCommandContext
};
