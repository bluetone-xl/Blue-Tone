import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'approve',
  description: 'Approves pending member requests for joining the group (Admin & Owner Only)',
  category: 'admin',
  adminOnly: true,
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID, mentions } = event;

    try {
      // Permission Check: Owner or Group Admin
      const isOwner = Permissions.isOwner(senderID);
      const isAdmin = await Permissions.isGroupAdmin(api, threadID, senderID);

      if (!isOwner && !isAdmin) {
        return api.sendMessage('⚠️ Access Denied: Only Group Admins or the Bot Owner can approve pending requests.', threadID, messageID);
      }

      const subCommand = args[0] ? args[0].toLowerCase() : null;

      // -------------------------------------------------------------
      // CASE 1: Approve All Pending Requests (`!approve all`)
      // -------------------------------------------------------------
      if (subCommand === 'all') {
        try {
          // Fetch pending approval requests for the thread
          const approvalQueue = await api.getThreadApprovalQueue(threadID);
          
          if (!approvalQueue || approvalQueue.length === 0) {
            return api.sendMessage('ℹ️️ No pending join requests found for this group.', threadID, messageID);
          }

          let approvedCount = 0;
          for (const request of approvalQueue) {
            try {
              await api.handleGroupJoinRequest(request.node.id, threadID, true);
              approvedCount++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1s safe delay
            } catch (err) {
              Logger.error('APPROVE_ALL', `Failed to approve request for ${request.node.id}:`, err.message);
            }
          }

          return api.sendMessage(`✅ [APPROVAL COMPLETED] Successfully approved ${approvedCount} pending request(s).`, threadID, messageID);
        } catch (queueErr) {
          Logger.error('APPROVE_QUEUE_ERR', 'Error fetching approval queue:', queueErr.message);
          return api.sendMessage(`❌ Failed to process approval queue: ${queueErr.message}`, threadID, messageID);
        }
      }

      // -------------------------------------------------------------
      // CASE 2: Approve Single Targeted User (`!approve @mention` or `!approve <UID>`)
      // -------------------------------------------------------------
      let targetUid = null;
      if (mentions && Object.keys(mentions).length > 0) {
        targetUid = Object.keys(mentions)[0];
      } else if (subCommand && !isNaN(subCommand)) {
        targetUid = subCommand;
      }

      if (!targetUid) {
        return api.sendMessage(
          "⚠️ Approval Usage:\n" +
          "• `!approve all` - Approve all pending join requests\n" +
          "• `!approve @mention` / `!approve <UID>` - Approve a specific user",
          threadID, messageID
        );
      }

      await api.handleGroupJoinRequest(targetUid, threadID, true);
      return api.sendMessage(`✅ [APPROVED] Join request for UID: ${targetUid} has been approved.`, threadID, messageID);

    } catch (error) {
      Logger.error('APPROVE_CMD_ERR', 'Error executing approve command:', error.message);
      return api.sendMessage(`❌ Failed to execute approval: ${error.message}`, threadID, messageID);
    }
  }
};
