import { isBotOwner } from '../../core/auth.js';

// Temporary memory store for requested lists
const pendingRequestsMap = new Map();

export default {
  name: 'requests',
  description: 'View and approve pending join requests',
  async execute(ctx) {
    const { groupId, args, senderId, fbApi, isBotAdmin, targetGroupId, isGroupAdmin } = ctx;
    const activeGroupId = targetGroupId || groupId;

    if (!activeGroupId) {
      return { text: '⚠️ Target Group ID required.' };
    }

    if (!isBotAdmin) {
      return { text: '❌ Bot must be an Admin to view or approve join requests.' };
    }

    if (!isBotOwner(senderId) && !isGroupAdmin) {
      return { text: '❌ Only Group Admins or Bot Owner can view join requests.' };
    }

    const subAction = args[0]?.toLowerCase();

    // 1. Approve by Serial Number
    if (subAction === 'approve') {
      const serialIndex = parseInt(args[1], 10) - 1;
      const list = pendingRequestsMap.get(activeGroupId) || [];

      if (isNaN(serialIndex) || serialIndex < 0 || serialIndex >= list.length) {
        return { text: '⚠️️ Invalid Serial Number. Please run `!requests` to view the list first.' };
      }

      const targetRequest = list[serialIndex];

      try {
        if (fbApi?.approveJoinRequest) {
          await fbApi.approveJoinRequest(activeGroupId, targetRequest.uid);
        }

        // Remove approved item from list
        list.splice(serialIndex, 1);
        pendingRequestsMap.set(activeGroupId, list);

        return { text: `✅ Approved **${targetRequest.name}** (\`${targetRequest.uid}\`) to group \`${activeGroupId}\`!` };
      } catch (err) {
        return { text: `❌ Failed to approve request: ${err.message}` };
      }
    }

    // 2. View Pending Requests List
    try {
      let pendingList = [];
      if (fbApi?.getPendingRequests) {
        pendingList = await fbApi.getPendingRequests(activeGroupId);
      } else {
        // Mock Data for Testing
        pendingList = [
          { uid: '100099901', name: 'Rahim Ahmed' },
          { uid: '100099902', name: 'Karim Hasan' }
        ];
      }

      pendingRequestsMap.set(activeGroupId, pendingList);

      if (!pendingList || pendingList.length === 0) {
        return { text: '📋 No pending join requests for this group.' };
      }

      let response = `📋 **Pending Join Requests for \`${activeGroupId}\`:**\n\n`;
      pendingList.forEach((req, idx) => {
        response += `[${idx + 1}] ${req.name} (UID: \`${req.uid}\`)\n`;
      });

      response += `\n👉 Reply \`!requests approve <serial_no>\` to approve member.`;
      return { text: response };
    } catch (err) {
      return { text: `❌ Failed to fetch pending requests: ${err.message}` };
    }
  }
};
