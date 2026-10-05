import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'group',
  description: 'Manage group photo, theme, and nicknames',
  async execute(ctx) {
    const { groupId, args, senderId, quotedMessage, fbApi, isGroupAdmin, targetGroupId } = ctx;
    const activeGroupId = targetGroupId || groupId;

    if (!activeGroupId) {
      return { text: '⚠️ Group ID (threadId) is required for this action.' };
    }

    if (!isBotOwner(senderId) && !isGroupAdmin) {
      return { text: '❌ Unauthorized: Only Group Admins or Bot Owner can use group controls.' };
    }

    const subCommand = args[0]?.toLowerCase();

    // 1. Change Group Image
    if (subCommand === 'photo' || subCommand === 'avatar') {
      const imageUrl = quotedMessage?.imageUrl || args[1];
      if (!imageUrl) {
        return { text: '⚠️ Please reply to an image or provide an image URL.' };
      }

      try {
        if (fbApi?.changeGroupImage) {
          await fbApi.changeGroupImage(imageUrl, activeGroupId);
          return { text: `✅ Group photo updated successfully for group \`${activeGroupId}\`!` };
        }
        return { text: `📷 [Simulated] Group photo updated for thread: ${activeGroupId}` };
      } catch (err) {
        return { text: `❌ Failed to update group photo: ${err.message}` };
      }
    }

    // 2. Change Group Theme
    if (subCommand === 'theme') {
      const themeId = args[1];
      if (!themeId) return { text: '⚠️ Please provide a Theme ID or Name.' };

      try {
        if (fbApi?.changeThreadColor) {
          await fbApi.changeThreadColor(themeId, activeGroupId);
          return { text: `🎨 Group theme updated for group \`${activeGroupId}\`!` };
        }
        return { text: `🎨 [Simulated] Group theme changed to "${themeId}" for thread: ${activeGroupId}` };
      } catch (err) {
        return { text: `❌ Failed to change group theme: ${err.message}` };
      }
    }

    // 3. Set Member Nickname
    if (subCommand === 'nickname' || subCommand === 'setnick') {
      const targetUid = args[1];
      const nickname = args.slice(2).join(' ');

      if (!targetUid || !nickname) {
        return { text: '⚠️ Usage: !group nickname <UID> <New Nickname>' };
      }

      try {
        if (fbApi?.changeNickname) {
          await fbApi.changeNickname(nickname, activeGroupId, targetUid);
          return { text: `✏️ Nickname for UID \`${targetUid}\` updated to "${nickname}".` };
        }
        return { text: `✏️ [Simulated] Set nickname "${nickname}" for UID: ${targetUid}` };
      } catch (err) {
        return { text: `❌ Failed to update nickname: ${err.message}` };
      }
    }

    return { 
      text: `🛠️ **Group Settings Commands:**\n` +
            `• \`!group photo\` (Reply to an image) - Change Group Photo\n` +
            `• \`!group theme <theme_id>\` - Change Group Theme\n` +
            `• \`!group nickname <UID> <Name>\` - Change Member Nickname`
    };
  }
};
