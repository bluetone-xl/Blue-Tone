import Logger from '../core/logger.js';

export default {
  name: 'groupinfo',
  description: 'Displays detailed information about the current group thread',
  category: 'general',
  aliases: ['ginfo', 'threadinfo'],
  async execute({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const threadInfo = await api.getThreadInfo(threadID);

      if (!threadInfo) {
        return api.sendMessage('❌ Unable to retrieve thread information.', threadID, messageID);
      }

      const threadName = threadInfo.threadName || 'Unnamed Group';
      const memberCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : 0;
      const adminCount = threadInfo.adminIDs ? threadInfo.adminIDs.length : 0;
      const emoji = threadInfo.emoji || 'None';

      const infoMsg = 
        `📊 Group Information\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🏷️ Name: ${threadName}\n` +
        `🆔 Thread ID: ${threadID}\n` +
        `👥 Total Members: ${memberCount}\n` +
        `👑 Group Admins: ${adminCount}\n` +
        `🍒 Default Emoji: ${emoji}`;

      return api.sendMessage(infoMsg, threadID, messageID);

    } catch (error) {
      Logger.error('GROUPINFO_CMD_ERR', 'Error fetching group info:', error.message);
      return api.sendMessage(`❌ Failed to retrieve group info: ${error.message}`, threadID, messageID);
    }
  }
};
