import permissions from '../security/permissions.js';
import botConfig from '../config/botConfig.js';
import Logger from '../core/logger.js';

export default {
  name: 'management',
  description: 'Manages bot system settings and Management Control Room registration',
  category: 'owner',
  aliases: ['setmanagement', 'setmcr', 'mcr'],
  ownerOnly: true,
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID, isGroup } = event;

    try {
      // 1. Strict Owner Permission Check
      if (!permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Restricted to the Bot Owner.', threadID, messageID);
      }

      const subCommand = args[0] ? args[0].toLowerCase() : 'set';

      // 2. Register current group as Management Control Room
      if (subCommand === 'set' || subCommand === 'register' || event.body.toLowerCase().startsWith('!setmanagement')) {
        if (!isGroup) {
          return api.sendMessage('⚠️ This command can only be executed within a group thread.', threadID, messageID);
        }

        botConfig.setManagementGroupID(threadID);

        const successMsg = 
          `✅ [MANAGEMENT CONTROL ROOM REGISTERED]\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `🆔 Thread ID: ${threadID}\n` +
          `📌 Status: Active Management Control Room updated successfully.`;

        Logger.info('CONFIG', `Management Group ID updated to: ${threadID} by Owner [${senderID}]`);
        return api.sendMessage(successMsg, threadID, messageID);
      }

      // 3. Status Check
      if (subCommand === 'status' || subCommand === 'info') {
        const currentMCR = botConfig.getManagementGroupID();
        const statusMsg = 
          `📊 [MANAGEMENT CONTROL ROOM STATUS]\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `🆔 Current MCR ID: ${currentMCR || 'Not Registered'}`;

        return api.sendMessage(statusMsg, threadID, messageID);
      }

      return api.sendMessage('💡 Usage: `!setmanagement` or `!management status`', threadID, messageID);

    } catch (error) {
      Logger.error('MANAGEMENT_CMD_ERR', 'Error executing management command:', error.message);
      return api.sendMessage(`❌ Management operation failed: ${error.message}`, threadID, messageID);
    }
  }
};
