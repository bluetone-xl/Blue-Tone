import { isGroupAdmin } from '../core/auth.js';
import { LogQuery } from '../database/queries.js';

const warningStore = new Map();

export default function registerWarningCommands(runtime) {
  // Warn User (Admins Only)
  runtime.registerCommand({
    name: 'warn',
    execute: async (ctx) => {
      if (!ctx.groupId) return { text: '⚠️ Group command only.' };

      if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can warn members.' };
      }

      const targetId = ctx.args[0];
      const reason = ctx.args.slice(1).join(' ') || 'No reason specified';

      if (!targetId) return { text: `⚠️ Usage: ${ctx.prefix}warn <user_uid> [reason]` };

      const key = `${ctx.groupId}_${targetId}`;
      const currentWarns = (warningStore.get(key) || 0) + 1;
      warningStore.set(key, currentWarns);

      await LogQuery.add(ctx.senderId, ctx.groupId, `warn ${targetId}`, 'SUCCESS');

      let response = `⚠️ User @${targetId} has been warned.\nReason: ${reason}\nWarnings: ${currentWarns}/3`;
      if (currentWarns >= 3) {
        response += `\n🚨 Limit reached! Action recommended against user.`;
      }

      return { text: response };
    }
  });

  // Check Warnings
  runtime.registerCommand({
    name: 'warnings',
    execute: async (ctx) => {
      if (!ctx.groupId) return { text: '⚠️ Group command only.' };
      const targetId = ctx.args[0] || ctx.senderId;
      const key = `${ctx.groupId}_${targetId}`;
      const count = warningStore.get(key) || 0;

      return { text: `📋 User @${targetId} has ${count} warning(s).` };
    }
  });

  // Reset Warnings (Admins Only)
  runtime.registerCommand({
    name: 'unwarn',
    execute: async (ctx) => {
      if (!ctx.groupId) return { text: '⚠️ Group command only.' };

      if (!isGroupAdmin(ctx.userRole, ctx.senderId)) {
        return { text: '❌ Unauthorized: Only Group Admins can reset warnings.' };
      }

      const targetId = ctx.args[0];
      if (!targetId) return { text: `⚠️ Usage: ${ctx.prefix}unwarn <user_uid>` };

      const key = `${ctx.groupId}_${targetId}`;
      warningStore.delete(key);

      return { text: `✅ Warnings reset for user @${targetId}.` };
    }
  });
}
