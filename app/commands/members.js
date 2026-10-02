import { UserQuery, GroupQuery } from '../database/queries.js';

export default function registerMemberCommands(runtime) {
  // Check User Profile
  runtime.registerCommand({
    name: 'profile',
    execute: async (ctx) => {
      const targetUid = ctx.args[0] || ctx.senderId;
      const user = await UserQuery.getByUid(targetUid);

      if (!user) {
        return { text: `❌ User profile not found for ID: ${targetUid}` };
      }

      return {
        text: `👤 *USER PROFILE*\n\n` +
              `• UID: ${user.uid}\n` +
              `• Name: ${user.name}\n` +
              `• Role: ${user.role.toUpperCase()}\n` +
              `• Registered: ${new Date(user.created_at).toLocaleDateString()}`
      };
    }
  });

  // Check Current Prefix
  runtime.registerCommand({
    name: 'prefix',
    execute: async (ctx) => {
      let prefix = ctx.prefix || '!';
      if (ctx.groupId) {
        const group = await GroupQuery.getById(ctx.groupId);
        if (group?.prefix) prefix = group.prefix;
      }
      return { text: `📌 Current command prefix for this group is: \`${prefix}\`` };
    }
  });
}
