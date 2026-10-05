import Permissions from '../security/permissions.js';
import BotConfig from '../config/botConfig.js';
import Logger from '../core/logger.js';

export default {
  name: 'groupdestroy',
  description: 'Cleans non-admin members from specific or all threads with a safety delay (Owner Only)',
  category: 'owner',
  ownerOnly: true,
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID } = event;

    try {
      // Access Control: Strict Owner Check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage(
          BotConfig.getNotice('accessDeniedOwner'),
          threadID,
          messageID
        );
      }

      const target = args[0] ? args[0].toLowerCase() : null;

      // Helper function to process member removal in a thread
      const destroyThread = async (targetThreadID) => {
        try {
          const threadInfo = await api.getThreadInfo(targetThreadID);
          if (!threadInfo) return 0;

          const adminIDs = new Set((threadInfo.adminIDs || []).map(a => String(a.id)));
          const ownerUid = Permissions.getOwnerUid();
          const botUid = api.getCurrentUserID();

          // Filter candidates: exclude Bot Owner, Bot itself, and Facebook Group Admins
          const membersToKick = threadInfo.participantIDs.filter(id => {
            const sId = String(id);
            return sId !== ownerUid && sId !== String(botUid) && !adminIDs.has(sId);
          });

          await api.sendMessage(
            BotConfig.getNotice('groupdestroyStart'),
            targetThreadID
          );

          let count = 0;
          for (const memberID of membersToKick) {
            try {
              await api.removeUserFromGroup(memberID, targetThreadID);
              count++;
              // Safe 2-second delay to prevent rate-limiting
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
              Logger.error('GROUP_DESTROY', `Failed to remove user ${memberID} from ${targetThreadID}:`, err.message);
            }
          }

          await api.sendMessage(
            BotConfig.getNotice('groupdestroyComplete', { count }),
            targetThreadID
          );

          return count;
        } catch (err) {
          Logger.error('GROUP_DESTROY', `Failed to process thread ${targetThreadID}:`, err.message);
          return 0;
        }
      };

      // -------------------------------------------------------------
      // SCOPE 1: Target All Threads (`!groupdestroy all`)
      // -------------------------------------------------------------
      if (target === 'all') {
        if (!Permissions.isManagementGroup(threadID)) {
          return api.sendMessage('⚠️ The `all` flag can only be executed from the Management Control Room.', threadID, messageID);
        }

        api.sendMessage('🚨 Starting Global Group Cleanup on all connected threads...', threadID, messageID);
        
        const threadList = await api.getThreadList(100, null, ['INBOX']);
        let totalRemoved = 0;

        for (const thread of threadList) {
          if (thread.isGroup && String(thread.threadID) !== String(threadID)) {
            const removed = await destroyThread(thread.threadID);
            totalRemoved += removed;
          }
        }

        return api.sendMessage(`✅ [GLOBAL CLEANUP COMPLETED] Total members removed across all threads: ${totalRemoved}`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // SCOPE 2: Specific Thread ID Target (`!groupdestroy <Thread_ID>`)
      // -------------------------------------------------------------
      if (target && !isNaN(target)) {
        api.sendMessage(`⏳ Initiating cleanup on target thread: ${target}...`, threadID, messageID);
        const count = await destroyThread(target);
        return api.sendMessage(`✅ Cleanup completed for thread ${target}. Total removed: ${count}`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // SCOPE 3: Direct Current Group Cleanup (`!groupdestroy`)
      // -------------------------------------------------------------
      await destroyThread(threadID);

    } catch (error) {
      Logger.error('GROUP_DESTROY_ERR', 'Error executing groupdestroy command:', error.message);
      return api.sendMessage(`❌ Groupdestroy execution failed: ${error.message}`, threadID, messageID);
    }
  }
};
