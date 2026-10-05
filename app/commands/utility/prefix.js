import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'prefix',
  description: 'View or change the command prefix for the current group',
  async execute(ctx) {
    const { groupId, args, senderId, prefix, isGroupAdmin } = ctx;

    try {
      const DEFAULT_GLOBAL_PREFIX = '!'; // Global Default Prefix

      // 1. If no args provided, show current group & global prefix
      if (!args[0]) {
        return {
          text: `📌 **Prefix Information:**\n` +
                `• Current Group Prefix: \`${prefix || DEFAULT_GLOBAL_PREFIX}\`\n` +
                `• Global Default Prefix: \`${DEFAULT_GLOBAL_PREFIX}\`\n\n` +
                `👉 To change prefix: \`${prefix || DEFAULT_GLOBAL_PREFIX}prefix <new_prefix>\``
        };
      }

      // Check group context for updating prefix
      if (!groupId) {
        return { text: '⚠️ Changing prefix is only supported inside groups.' };
      }

      // Permissions check for updating prefix
      if (!isBotOwner(senderId) && !isGroupAdmin) {
        return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can change the group prefix.' };
      }

      const newPrefix = args[0].trim();

      if (newPrefix.length > 5) {
        return { text: '⚠️ Prefix cannot be longer than 5 characters.' };
      }

      // 2. Update Group Prefix in Database
      await db.query(
        `INSERT INTO groups (group_id, prefix) 
         VALUES ($1, $2) 
         ON CONFLICT (group_id) 
         DO UPDATE SET prefix = $2;`,
        [groupId, newPrefix]
      );

      return { 
        text: `✅ Prefix updated successfully!\n` +
              `• New Group Prefix: \`${newPrefix}\`\n` +
              `• Global Default Prefix: \`${DEFAULT_GLOBAL_PREFIX}\`` 
      };
    } catch (err) {
      console.error('Error updating prefix:', err);
      return { text: `❌ Failed to execute prefix command: ${err.message}` };
    }
  }
};
