import { isGroupAdmin } from '../core/auth.js';
import { LogQuery } from '../database/queries.js';

export default function registerGroupAdminCommands(runtime) {
  try {
    if (!runtime || typeof runtime.registerCommand !== 'function') {
      console.warn('⚠️ [GroupAdminCommands] Runtime registerCommand method is missing.');
      return;
    }

    // 1. Notice Command (Admins Only)
    runtime.registerCommand({
      name: 'notice',
      execute: async (ctx) => {
        try {
          const { userRole, senderId, args, prefix } = ctx;

          if (!isGroupAdmin(userRole, senderId)) {
            return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can send notices.' };
          }

          const noticeText = args.join(' ').trim();
          if (!noticeText) {
            return { text: `⚠️ Usage: \`${prefix || '!'}notice <your_announcement>\`` };
          }

          return {
            text: `📢 **GROUP ANNOUNCEMENT**\n\n${noticeText}\n\n— Posted by Admin`
          };
        } catch (err) {
          return { text: `❌ Failed to publish notice: ${err.message}` };
        }
      }
    });

    // 2. Kick Command (Admins Only)
    runtime.registerCommand({
      name: 'kick',
      execute: async (ctx) => {
        try {
          const { userRole, senderId, groupId, args, prefix } = ctx;

          if (!isGroupAdmin(userRole, senderId)) {
            return { text: '❌ Unauthorized: Only Group Admins can use kick command.' };
          }

          const targetId = args[0]?.trim();
          if (!targetId) {
            return { text: `⚠️ Usage: \`${prefix || '!'}kick <user_uid>\`` };
          }

          // Safe execution of Async Database Query
          await LogQuery.add(senderId, groupId, `kick ${targetId}`, 'SUCCESS');
          return { text: `🚫 Request to kick user @${targetId} processed.` };
        } catch (err) {
          console.error('Error executing kick command:', err);
          return { text: `❌ Failed to process kick command: ${err.message}` };
        }
      }
    });

    console.log('✅ [GroupAdminCommands] Commands registered successfully.');
  } catch (err) {
    console.error('❌ [GroupAdminCommands] Module initialization failed:', err.message);
  }
}
