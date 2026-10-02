import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'prefix',
  description: 'Change the command prefix for the current group',
  async execute(ctx) {
    const { groupId, args, senderId, prefix } = ctx;

    if (!groupId) {
      return { text: '⚠️ This command can only be used inside a group.' };
    }

    if (!isBotOwner(senderId)) {
      return { text: '❌ Unauthorized: Only the bot owner/group admin can change prefix.' };
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return { text: `ℹ️ Current prefix is: \`${prefix}\`\nUsage: \`${prefix}prefix <new_prefix>\`` };
    }

    if (newPrefix.length > 5) {
      return { text: '⚠️ Prefix cannot be longer than 5 characters.' };
    }

    try {
      await db.query(
        `INSERT INTO groups (group_id, prefix) 
         VALUES ($1, $2) 
         ON CONFLICT (group_id) 
         DO UPDATE SET prefix = $2;`,
        [groupId, newPrefix]
      );

      return { text: `✅ Prefix updated successfully! New prefix for this group is: \`${newPrefix}\`` };
    } catch (err) {
      console.error('Error updating prefix:', err);
      return { text: '❌ Failed to update prefix in database.' };
    }
  }
};
