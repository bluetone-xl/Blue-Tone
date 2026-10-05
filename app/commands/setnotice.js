import Permissions from '../security/permissions.js';
import BotConfig from '../config/botConfig.js';
import Logger from '../core/logger.js';

export default {
  name: 'setnotice',
  description: 'Dynamically update any system notice or reply template text (Owner Only)',
  category: 'owner',
  ownerOnly: true,
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID } = event;

    try {
      // Access Control: Strict Owner Check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Restricted to the Bot Owner.', threadID, messageID);
      }

      const noticeKey = args[0];
      const newTemplate = args.slice(1).join(' ');

      if (!noticeKey || !newTemplate) {
        return api.sendMessage(
          "⚠️ Notice Customization Usage:\n" +
          "• `!setnotice <key> <new template text>`\n\n" +
          "Available Keys:\n" +
          "• `welcome` - Group welcome message\n" +
          "• `leave` - Member leave notice\n" +
          "• `groupDestroyStart` - Group cleanup start notice\n" +
          "• `groupDestroyComplete` - Group cleanup finish notice\n" +
          "• `accessDeniedOwner` - Owner permission restriction message\n" +
          "• `accessDeniedAdmin` - Admin permission restriction message",
          threadID, messageID
        );
      }

      BotConfig.updateNotice(noticeKey, newTemplate);

      return api.sendMessage(
        `✅ [NOTICE UPDATED]\n━━━━━━━━━━━━━━━━━━\n` +
        `🔑 Key: ${noticeKey}\n` +
        `💬 New Template:\n"${newTemplate}"`,
        threadID, messageID
      );

    } catch (error) {
      Logger.error('SETNOTICE_CMD_ERR', 'Error updating notice template:', error.message);
      return api.sendMessage(`❌ Failed to update notice template: ${error.message}`, threadID, messageID);
    }
  }
};
