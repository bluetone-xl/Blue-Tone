import Permissions from '../security/permissions.js';
import BotConfig from '../config/botConfig.js';
import Logger from '../core/logger.js';

export default {
  name: 'setmanagement',
  description: 'Sets the current group as the Management Control Room (Owner Only)',
  category: 'owner',
  aliases: ['setmcr', 'setcontrolroom'],
  ownerOnly: true,
  async execute({ api, event }) {
    const { threadID, senderID, messageID, isGroup } = event;

    try {
      // 1. Strict Owner Permission Check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Restricted to the Bot Owner.', threadID, messageID);
      }

      // 2. Ensure execution inside a group thread
      if (!isGroup) {
        return api.sendMessage('⚠️ This command can only be executed within a group thread.', threadID, messageID);
      }

      // 3. Update the management group ID dynamically in BotConfig
      BotConfig.setManagementGroupID(threadID);

      const successMsg = 
        `✅ [MANAGEMENT CONTROL ROOM SET]\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 Group ID: ${threadID}\n` +
        `📌 Status: This thread is now registered as the active Management Control Room.`;

      Logger.info('CONFIG', `Management Group ID updated to: ${threadID} by Owner [${senderID}]`);

      return api.sendMessage(successMsg, threadID, messageID);

    } catch (error) {
      Logger.error('SET_MCR_ERR', 'Error setting management group ID:', error.message);
      return api.sendMessage(`❌ Failed to set Management Control Room: ${error.message}`, threadID, messageID);
    }
  }
};
