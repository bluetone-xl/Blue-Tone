import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'add',
  description: 'Add member via UID or Approve Join Requests',
  async execute(ctx) {
    const { groupId, args, senderId, fbApi, isBotAdmin, targetGroupId, targetUid } = ctx;
    const activeGroupId = targetGroupId || groupId;
    const activeUserUid = targetUid || args[0];

    if (!activeGroupId) {
      return { text: '⚠️ Target Group ID required.' };
    }

    try {
      // 1. Check Group Approval Status from Database
      const dbRes = await db.query('SELECT approval_mode FROM groups WHERE group_id = $1', [activeGroupId]);
      const isApprovalOn = dbRes.rows[0]?.approval_mode || false;

      // Rule: If Bot is Admin AND Admin Approval is ON -> General members cannot add
      if (isBotAdmin && isApprovalOn && !isBotOwner(senderId)) {
        return { text: '❌ Admin Approval is ON! Only Bot Owner can directly add members.' };
      }

      if (!activeUserUid) {
        return { text: '⚠️ Please provide a Facebook User UID or Profile Link.' };
      }

      // Extract raw UID if FB link or text is passed
      const cleanedUid = activeUserUid.replace(/[^0-9]/g, '');

      if (!cleanedUid) {
        return { text: '❌ Invalid User UID provided.' };
      }

      // 2. Add User via FB API
      if (fbApi?.addUserToGroup) {
        await fbApi.addUserToGroup(cleanedUid, activeGroupId);
        return { text: `✅ Added UID \`${cleanedUid}\` to group \`${activeGroupId}\`!` };
      }

      return { text: `➕ [Simulated] Added user \`${cleanedUid}\` to group \`${activeGroupId}\`.` };
    } catch (err) {
      return { text: `❌ Failed to add member: ${err.message}` };
    }
  }
};
