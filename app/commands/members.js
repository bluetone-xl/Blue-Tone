import { UserQuery, GroupQuery } from '../database/queries.js';

export default function registerMemberCommands(runtime) {
  try {
    if (!runtime || typeof runtime.registerCommand !== 'function') {
      console.warn('⚠️ [MemberCommands] Runtime or registerCommand method is missing.');
      return;
    }

    // 1. Check User Profile
    runtime.registerCommand({
      name: 'profile',
      execute: async (ctx) => {
        try {
          const targetUid = ctx.args[0]?.trim() || ctx.senderId;
          const user = await UserQuery.getByUid(targetUid);

          if (!user) {
            return { text: `❌ User profile not found for ID: \`${targetUid}\`` };
          }

          const roleFormatted = user.role ? user.role.toUpperCase() : 'MEMBER';
          const regDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

          return {
            text: `👤 **USER PROFILE**\n\n` +
                  `• **UID:** \`${user.uid}\`\n` +
                  `• **Name:** ${user.name || 'N/A'}\n` +
                  `• **Role:** ${roleFormatted}\n` +
                  `• **Registered:** ${regDate}`
          };
        } catch (err) {
          console.error('Error fetching user profile:', err);
          return { text: `❌ Failed to load profile: ${err.message}` };
        }
      }
    });

    // 2. Check Current Prefix
    runtime.registerCommand({
      name: 'prefix',
      execute: async (ctx) => {
        try {
          const DEFAULT_GLOBAL_PREFIX = '!';
          let currentPrefix = ctx.prefix || DEFAULT_GLOBAL_PREFIX;

          if (ctx.groupId) {
            const group = await GroupQuery.getById(ctx.groupId);
            if (group?.prefix) {
              currentPrefix = group.prefix;
            }
          }

          return {
            text: `📌 **Prefix Information:**\n` +
                  `• Current Group Prefix: \`${currentPrefix}\`\n` +
                  `• Global Default Prefix: \`${DEFAULT_GLOBAL_PREFIX}\``
          };
        } catch (err) {
          console.error('Error fetching prefix:', err);
          return { text: `❌ Failed to fetch prefix: ${err.message}` };
        }
      }
    });

    console.log('✅ [MemberCommands] Member commands registered successfully.');
  } catch (err) {
    console.error('❌ [MemberCommands] Module initialization failed:', err.message);
  }
}
