import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'setnotice',
  description: 'Set custom welcome, leave, or remove messages for this group',
  async execute(ctx) {
    const { groupId, args, senderId, prefix } = ctx;

    if (!groupId) {
      return { text: '⚠️ This command can only be used inside a group.' };
    }

    if (!isBotOwner(senderId)) {
      return { text: '❌ Unauthorized: Only group admin or bot owner can change notices.' };
    }

    const type = args[0]?.toLowerCase(); // welcome, leave, remove
    const customText = args.slice(1).join(' ');

    if (!['welcome', 'leave', 'remove'].includes(type) || !customText) {
      return {
        text: `ℹ️ **Usage:** \`${prefix}setnotice <welcome|leave|remove> <your message>\`\n\n` +
              `**Available Variables:**\n` +
              `• \`{name}\` - Member name/UID\n` +
              `• \`{group}\` - Group ID/Name`
      };
    }

    const column = `${type}_msg`;

    try {
      await db.query(
        `INSERT INTO groups (group_id, ${column}) 
         VALUES ($1, $2) 
         ON CONFLICT (group_id) 
         DO UPDATE SET ${column} = $2;`,
        [groupId, customText]
      );

      return { text: `✅ Successfully updated **${type}** notice for this group!` };
    } catch (err) {
      console.error('Error updating notice:', err);
      return { text: '❌ Failed to save notice settings in database.' };
    }
  }
};
