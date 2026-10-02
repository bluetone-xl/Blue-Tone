import { isGroupAdmin } from '../core/auth.js';
import { LogQuery } from '../database/queries.js';

export default function registerGroupAdminCommands(runtime) {
  // Notice Command (Admins Only)
  runtime.registerCommand({
    name: 'notice',
    execute: async (ctx) => {
      if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can send notices.' };
      }

      const noticeText = ctx.args.join(' ');
      if (!noticeText) {
        return { text: `⚠️ Usage: ${ctx.prefix}notice <your_announcement>` };
      }

      return {
        text: `📢 *GROUP ANNOUNCEMENT*\n\n${noticeText}\n\n— Posted by Admin`
      };
    }
  });

  // Kick Command (Admins Only)
  runtime.registerCommand({
    name: 'kick',
    execute: async (ctx) => {
      if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Group Admins can use kick command.' };
      }

      const targetId = ctx.args[0];
      if (!targetId) {
        return { text: `⚠️ Usage: ${ctx.prefix}kick <user_uid>` };
      }

      await LogQuery.add(ctx.senderId, ctx.groupId, `kick ${targetId}`, 'SUCCESS');
      return { text: `🚫 Request to kick user @${targetId} processed.` };
    }
  });
}
