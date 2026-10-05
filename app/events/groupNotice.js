import botConfig from '../config/botConfig.js';
import Logger from '../core/logger.js';

export default async function handleGroupNotice({ api, event }) {
  const { threadID, logMessageType, logMessageData } = event;

  try {
    // 1. Welcome Notice (When a user joins)
    if (logMessageType === 'log:subscribe') {
      const welcomeMsg = botConfig.getNotice('welcome');
      if (welcomeMsg) {
        await api.sendMessage(welcomeMsg, threadID);
      }
    }

    // 2. Leave / Remove Notice (When a user leaves or is kicked)
    if (logMessageType === 'log:unsubscribe') {
      const leaveMsg = botConfig.getNotice('leave');
      if (leaveMsg) {
        await api.sendMessage(leaveMsg, threadID);
      }
    }
  } catch (error) {
    Logger.error('GROUP_NOTICE_ERR', 'Error sending group notice:', error.message);
  }
}
