import { GroupQuery } from '../database/queries.js';

export default function registerBuiltinCommands(runtime) {
  // Ping Command
  runtime.registerCommand({
    name: 'ping',
    execute: async (ctx) => {
      return { text: '🏓 Pong! BlueTone System is fully operational.' };
    }
  });

  // Set Prefix Command
  runtime.registerCommand({
    name: 'setprefix',
    execute: async (ctx) => {
      const newPrefix = ctx.args[0];
      if (!newPrefix) {
        return { text: `⚠️ Please specify a new prefix. Example: ${ctx.prefix}setprefix !` };
      }
      if (ctx.groupId) {
        await GroupQuery.setPrefix(ctx.groupId, newPrefix);
        return { text: `✅ Group prefix updated to: ${newPrefix}` };
      }
      return { text: '⚠️ This command can only be used inside a group.' };
    }
  });

  // Help Command
  runtime.registerCommand({
    name: 'help',
    execute: async (ctx) => {
      return {
        text: `🤖 *BlueTone Bot Commands*\n\n` +
              `• ${ctx.prefix}ping - Check bot latency & status\n` +
              `• ${ctx.prefix}setprefix <prefix> - Change group prefix\n` +
              `• ${ctx.prefix}help - Show available commands`
      };
    }
  });
}
