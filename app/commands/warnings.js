import { isGroupAdmin } from '../core/auth.js';
import { LogQuery } from '../database/queries.js';

// In-memory store for warning counts per group and user
const warningStore = new Map();

export default function registerWarningCommands(runtime) {
  try {
    if (!runtime || typeof runtime.registerCommand !== 'function') {
      console.warn('⚠️️ [WarningCommands] Runtime or registerCommand method is missing.');
      return;
    }

    // 1. Warn User (Admins Only)
    runtime.registerCommand({
      name: 'warn',
      execute: async (ctx) => {
        try {
          if (!ctx.groupId) return { text: '⚠️ Group command only.' };

          if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
            return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can warn members.' };
          }

          const targetId = ctx.args[0]?.trim();
          const reason = ctx.args.slice(1).join(' ').trim() || 'No reason specified';

          if (!targetId) {
            return { text: `⚠️ Usage: \`${ctx.prefix || '!'}warn <user_uid> [reason]\`` };
          }

          const key = `${ctx.groupId}_${targetId}`;
          const currentWarns = (warningStore.get(key) || 0) + 1;
          warningStore.set(key, currentWarns);

          // Safe execution of async query
          await LogQuery.add(ctx.senderId, ctx.groupId, `warn ${targetId}`, 'SUCCESS');

          let response = `⚠️️ **User Warning Issued**\n` +
                         `• User: \`${targetId}\`\n` +
                         `• Reason: ${reason}\n` +
                         `• Warnings: ${currentWarns}/3`;

          if (currentWarns >= 3) {
            response += `\n\n🚨 **Warning Limit Reached!** Admin action recommended against this user.`;
          }

          return { text: response };
        } catch (err) {
          console.error('Error executing warn command:', err);
          return { text: `❌ Failed to execute warn command: ${err.message}` };
        }
      }
    });

    // 2. Check Warnings
    runtime.registerCommand({
      name: 'warnings',
      execute: async (ctx) => {
        try {
          if (!ctx.groupId) return { text: '⚠️ Group command only.' };

          const targetId = ctx.args[0]?.trim() || ctx.senderId;
          const key = `${ctx.groupId}_${targetId}`;
          const count = warningStore.get(key) || 0;

          return { text: `📋 User \`${targetId}\` has **${count}** warning(s).` };
        } catch (err) {
          console.error('Error fetching warnings:', err);
          return { text: `❌ Failed to fetch warnings: ${err.message}` };
        }
      }
    });

    // 3. Reset Warnings (Admins Only)
    runtime.registerCommand({
      name: 'unwarn',
      execute: async (ctx) => {
        try {
          if (!ctx.groupId) return { text: '⚠️ Group command only.' };

          if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
            return { text: '❌ Unauthorized: Only Group Admins can reset warnings.' };
          }

          const targetId = ctx.args[0]?.trim();
          if (!targetId) {
            return { text: `⚠️ Usage: \`${ctx.prefix || '!'}unwarn <user_uid>\`` };
          }

          const key = `${ctx.groupId}_${targetId}`;
          warningStore.delete(key);

          return { text: `✅ Warnings successfully reset for user \`${targetId}\`.` };
        } catch (err) {
          console.error('Error resetting warnings:', err);
          return { text: `❌ Failed to reset warnings: ${err.message}` };
        }
      }
    });

    console.log('✅ [WarningCommands] Commands registered successfully.');
  } catch (err) {
    console.error('❌ [WarningCommands] Module initialization failed:', err.message);
  }
}
