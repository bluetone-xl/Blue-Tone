import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'security',
  description: 'Manage admin approvals, group link, and member additions',
  async execute(ctx) {
    const { groupId, args, senderId, fbApi, isBotAdmin, targetGroupId } = ctx;
    const activeGroupId = targetGroupId || groupId;

    if (!activeGroupId) return { text: '⚠️ Target Group ID required.' };

    const action = args[0]?.toLowerCase();

    // Fetch current settings from DB
    const res = await db.query('SELECT approval_mode, group_link_enabled FROM groups WHERE group_id = $1', [activeGroupId]);
    const currentSettings = res.rows[0] || { approval_mode: false, group_link_enabled: true };

    // 1. Toggle Admin Approval On/Off
    if (action === 'approval') {
      const mode = args[1]?.toLowerCase(); // 'on' or 'off'
      if (!['on', 'off'].includes(mode)) return { text: '⚠️ Usage: !security approval <on|off>' };

      if (!isBotAdmin) {
        return { text: '❌ Bot must be an Admin in the group to toggle Approval Mode.' };
      }

      const isApprovalOn = mode === 'on';
      await db.query(
        `INSERT INTO groups (group_id, approval_mode) VALUES ($1, $2)
         ON CONFLICT (group_id) DO UPDATE SET approval_mode = $2;`,
        [activeGroupId, isApprovalOn]
      );

      if (fbApi?.setAdminApproval) {
        await fbApi.setAdminApproval(activeGroupId, isApprovalOn);
      }

      return { text: `🛡️ Member Add Admin Approval is now **${mode.toUpperCase()}** for thread \`${activeGroupId}\`.` };
    }

    // 2. Toggle & Reset Group Link
    if (action === 'link') {
      const sub = args[1]?.toLowerCase(); // 'on', 'off', 'reset'
      if (!isBotAdmin) return { text: '❌ Bot must be an Admin to manage group link settings.' };

      if (sub === 'reset') {
        if (fbApi?.resetGroupLink) await fbApi.resetGroupLink(activeGroupId);
        return { text: `🔄 Group join link has been reset for \`${activeGroupId}\`.` };
      }

      if (['on', 'off'].includes(sub)) {
        const linkEnabled = sub === 'on';
        await db.query(
          `INSERT INTO groups (group_id, group_link_enabled) VALUES ($1, $2)
           ON CONFLICT (group_id) DO UPDATE SET group_link_enabled = $2;`,
          [activeGroupId, linkEnabled]
        );
        return { text: `🔗 Group Link access set to **${sub.toUpperCase()}**.` };
      }

      return { text: '⚠️️ Usage: !security link <on|off|reset>' };
    }

    return {
      text: `🔒 **Security Commands:**\n` +
            `• \`!security approval <on|off>\` - Toggle Member Add Approval\n` +
            `• \`!security link <on|off|reset>\` - Manage Join Link`
    };
  }
};
