import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'help',
  description: 'Displays all available commands or detailed info for a specific command',
  category: 'general',
  aliases: ['menu', 'cmds'],
  async execute({ api, event, args, commandLoader }) {
    const { threadID, messageID, senderID } = event;
    const prefix = process.env.BOT_PREFIX || '!';

    try {
      const target = args[0] ? args[0].toLowerCase() : null;

      // -------------------------------------------------------------
      // CASE 1: Detailed help for a specific command (`!help <command>`)
      // -------------------------------------------------------------
      if (target) {
        const cmd = commandLoader.getCommand(target);

        if (!cmd) {
          return api.sendMessage(`❌ Command '${target}' not found. Type \`${prefix}help\` to see all commands.`, threadID, messageID);
        }

        // Determine human-readable permission level
        let permissionText = 'Everyone (All Members)';
        const category = (cmd.category || 'general').toLowerCase();

        if (cmd.ownerOnly || category === 'owner' || category === 'account' || category === 'system') {
          permissionText = 'Bot Owner Only';
        } else if (category === 'admin' || category === 'group' || cmd.adminOnly) {
          permissionText = 'Group Admins & Bot Owner';
        } else if (category === 'settings' || cmd.expertAllowed) {
          permissionText = 'Group Experts, Group Admins & Bot Owner';
        }

        const aliasesText = cmd.aliases && cmd.aliases.length > 0 ? cmd.aliases.map(a => `${prefix}${a}`).join(', ') : 'None';
        const usageText = cmd.usage ? `${prefix}${cmd.name} ${cmd.usage}` : `${prefix}${cmd.name}`;

        const detailMsg = 
          `📖 Command Info: [ ${prefix}${cmd.name} ]\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📝 Description: ${cmd.description || 'No description provided.'}\n` +
          `🏷️ Category: ${category.toUpperCase()}\n` +
          `🔄 Aliases: ${aliasesText}\n` +
          `🔐 Permissions: ${permissionText}\n` +
          `💡 Usage: ${usageText}`;

        return api.sendMessage(detailMsg, threadID, messageID);
      }

      // -------------------------------------------------------------
      // CASE 2: Categorized full command list (`!help`)
      // -------------------------------------------------------------
      const commands = commandLoader.getAllCommands();
      const categories = {};

      // Group commands by category
      commands.forEach(cmd => {
        const cat = (cmd.category || 'General').toLowerCase();
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      });

      let helpMsg = `🤖 BlueTone Command Menu\n━━━━━━━━━━━━━━━━━━\n`;

      Object.keys(categories).forEach(cat => {
        const cmdList = categories[cat].map(c => `${prefix}${c}`).join(', ');
        helpMsg += `🔹 ${cat.toUpperCase()}\n${cmdList}\n\n`;
      });

      helpMsg += `━━━━━━━━━━━━━━━━━━\n💡 Type \`${prefix}help <command>\` for detailed usage and permissions.`;

      return api.sendMessage(helpMsg, threadID, messageID);

    } catch (error) {
      Logger.error('HELP_CMD_ERR', 'Error executing help command:', error.message);
      return api.sendMessage(`❌ Failed to display help menu: ${error.message}`, threadID, messageID);
    }
  }
};
