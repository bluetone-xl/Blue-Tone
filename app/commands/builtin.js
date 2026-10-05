import { GroupQuery } from '../database/queries.js';

export default function registerBuiltinCommands(runtime) {
  try {
    if (!runtime || typeof runtime.registerCommand !== 'function') {
      console.warn('⚠️ [BuiltinCommands] Runtime registerCommand method is missing.');
      return;
    }

    // 1. Ping Command
    runtime.registerCommand({
      name: 'ping',
      execute: async (ctx) => {
        try {
          const startTime = Date.now();
          const latency = Date.now() - startTime;
          return { text: `🏓 **Pong!**\n⚡ Response Time: ${latency}ms\n🟢 BlueTone System operational.` };
        } catch (err) {
          return { text: `❌ Ping execution failed: ${err.message}` };
        }
      }
    });

    // 2. Set Prefix Command
    runtime.registerCommand({
      name: 'setprefix',
      execute: async (ctx) => {
        try {
          const { groupId, args, senderId, isGroupAdmin, isBotOwner } = ctx;

          if (!groupId) {
            return { text: '⚠️ This command can only be used inside a group.' };
          }

          // Permission Check
          if (!isBotOwner?.(senderId) && !isGroupAdmin) {
            return { text: '❌ Only Group Admins or Bot Owner can change the prefix.' };
          }

          const newPrefix = args[0]?.trim();
          if (!newPrefix) {
            return { text: `⚠️ Please specify a new prefix. Example: \`${ctx.prefix || '!'}setprefix !\`` };
          }

          if (newPrefix.length > 5) {
            return { text: '⚠️ Prefix length cannot exceed 5 characters.' };
          }

          await GroupQuery.setPrefix(groupId, newPrefix);
          return { text: `✅ Group prefix successfully updated to: \`${newPrefix}\`` };
        } catch (err) {
          console.error('Error in setprefix:', err);
          return { text: `❌ Failed to update group prefix: ${err.message}` };
        }
      }
    });

    // 3. Help Command
    runtime.registerCommand({
      name: 'help',
      execute: async (ctx) => {
        try {
          const prefix = ctx.prefix || '!';
          return {
            text: `🤖 **BlueTone Bot Commands**\n\n` +
                  `• \`${prefix}ping\` - Check bot latency & status\n` +
                  `• \`${prefix}setprefix <prefix>\` - Change group prefix\n` +
                  `• \`${prefix}help\` - Show available commands`
          };
        } catch (err) {
          return { text: `❌ Failed to render help menu: ${err.message}` };
        }
      }
    });

    console.log('✅ [BuiltinCommands] Builtin commands registered successfully.');
  } catch (err) {
    console.error('❌ [BuiltinCommands] Module initialization failed:', err.message);
  }
}
