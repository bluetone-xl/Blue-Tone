import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'setnotice',
  description: 'Set custom welcome, leave, or remove messages for this group',
  async execute(ctx) {
    const { groupId, args, senderId, prefix, isGroupAdmin } = ctx;

    if (!groupId) {
      return { text: '⚠️ This command can only be used inside a group.' };
    }

    if (!isBotOwner(senderId) && !isGroupAdmin) {
      return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can change notices.' };
    }

    const type = args[0]?.toLowerCase(); // welcome, leave, remove
    const customText = args.slice(1).join(' ').trim();

    const allowedTypes = ['welcome', 'leave', 'remove'];
    if (!allowedTypes.includes(type) || !customText) {
      return {
        text: `ℹ️ **Usage:** \`${prefix}setnotice <welcome|leave|remove> <your message>\`\n\n` +
              `**Available Variables:**\n` +
              `• \`{name}\` - Member name/UID\n` +
              `• \`{group}\` - Group ID/Name`
      };
    }

    // Safe column mapping to avoid SQL injection
    const columnMap = {
      welcome: 'welcome_msg',
      leave: 'leave_msg',
      remove: 'remove_msg'
    };

    const targetColumn = columnMap[type];

    try {
      await db.query(
        `INSERT INTO groups (group_id, ${targetColumn}) 
         VALUES ($1, $2) 
         ON CONFLICT (group_id) 
         DO UPDATE SET ${targetColumn} = $2;`,
        [groupId, customText]
      );

      return { text: `✅ Successfully updated **${type}** notice for this group!` };
    } catch (err) {
      console.error('Error updating notice:', err);
      return { text: `❌ Failed to save notice settings in database: ${err.message}` };
    }
  }
};
