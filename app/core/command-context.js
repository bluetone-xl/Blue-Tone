import { getRole } from './roles.js';
import { resolveGroupId } from './group-id-resolver.js';

/**
 * Creates a standardized command execution context.
 * @param {Object} params
 * @returns {Object} Command context object
 */
export function createCommandContext({
  senderUid = null,
  groupId = null,
  groupAdmins = [],
  command = '',
  args = [],
  raw = '',
  isManagementGroup = false,
  selectedGroupId = null,
  targetUid = null
} = {}) {
  try {
    const resolvedGroupId = resolveGroupId({ groupId });
    const safeAdmins = Array.isArray(groupAdmins) ? groupAdmins : [];
    const role = getRole(senderUid, safeAdmins);

    const safeArgs = Array.isArray(args) 
      ? args.map(arg => String(arg ?? '')) 
      : [];

    return {
      senderUid: senderUid ? String(senderUid).trim() : null,
      targetUid: targetUid ? String(targetUid).trim() : null,
      groupId: resolvedGroupId,
      role: role || 'member',
      command: String(command || '').trim().toLowerCase(),
      args: safeArgs,
      raw: String(raw || ''),
      isManagementGroup: Boolean(isManagementGroup),
      selectedGroupId: selectedGroupId ? String(selectedGroupId).trim() : null
    };
  } catch (err) {
    console.error('❌ [CommandContext] Error creating context:', err.message);

    // Fallback safe context object
    return {
      senderUid: senderUid ? String(senderUid).trim() : null,
      targetUid: targetUid ? String(targetUid).trim() : null,
      groupId: groupId ? String(groupId).trim() : null,
      role: 'member',
      command: String(command || '').trim().toLowerCase(),
      args: Array.isArray(args) ? args : [],
      raw: String(raw || ''),
      isManagementGroup: Boolean(isManagementGroup),
      selectedGroupId: selectedGroupId ? String(selectedGroupId).trim() : null
    };
  }
}

export default createCommandContext;
