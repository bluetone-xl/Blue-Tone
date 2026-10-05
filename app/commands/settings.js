import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'settings',
  description: 'Manage group thread settings (Group Expert, Admin & Owner Only)',
  category: 'settings',
  expertAllowed: true,
  aliases: ['setname', 'setemoji', 'seticon', 'settheme'],
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID, type, messageReply } = event;

    try {
      // Access Control: Owner, Admin, or Group Expert
      const isOwner = Permissions.isOwner(senderID);
      const isAdmin = await Permissions.isGroupAdmin(api, threadID, senderID);
      const isExpert = Permissions.isGroupExpert(threadID, senderID);

      if (!isOwner && !isAdmin && !isExpert) {
        return api.sendMessage(
          '⚠️ Access Denied: Only Group Experts, Group Admins, or the Bot Owner can modify thread settings.',
          threadID, messageID
        );
      }

      // Determine action from invocation command or sub-argument
      let action = event.body.substring(1).split(' ')[0].toLowerCase();
      if (action === 'settings') {
        action = args[0] ? args[0].toLowerCase() : null;
      }

      // -------------------------------------------------------------
      // 1. CHANGE GROUP NAME (`!setname <New Name>`)
      // -------------------------------------------------------------
      if (action === 'setname' || action === 'name') {
        const newName = (action === 'setname') ? args.join(' ') : args.slice(1).join(' ');
        if (!newName) {
          return api.sendMessage('⚠️ Please provide a new name for the group.', threadID, messageID);
        }

        await api.setTitle(newName, threadID);
        return api.sendMessage(`✅ [THREAD NAME UPDATED] New group name: "${newName}"`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // 2. CHANGE CHAT EMOJI (`!setemoji <Emoji>`)
      // -------------------------------------------------------------
      if (action === 'setemoji' || action === 'emoji') {
        const newEmoji = (action === 'setemoji') ? args[0] : args[1];
        if (!newEmoji) {
          return api.sendMessage('⚠️ Please provide a single emoji character.', threadID, messageID);
        }

        await api.changeThreadEmoji(newEmoji, threadID);
        return api.sendMessage(`✅ [THREAD EMOJI UPDATED] New default emoji: ${newEmoji}`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // 3. CHANGE GROUP ICON/PICTURE (`!seticon`) - Reply to image
      // -------------------------------------------------------------
      if (action === 'seticon' || action === 'setimage' || action === 'icon') {
        if (type !== 'message_reply' || !messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
          return api.sendMessage('⚠️ Please reply to an image message with `!seticon`.', threadID, messageID);
        }

        const iconUrl = messageReply.attachments[0].url;
        if (!iconUrl) {
          return api.sendMessage('❌ Could not extract image URL from replied message.', threadID, messageID);
        }

        await api.changeThreadImage(iconUrl, threadID);
        return api.sendMessage('✅ [THREAD ICON UPDATED] Group image updated successfully!', threadID, messageID);
      }

      // Default Settings Usage Guide
      return api.sendMessage(
        "⚙️ Group Settings Commands (Expert/Admin/Owner):\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "• `!setname <New Name>` - Update group name\n" +
        "• `!setemoji <Emoji>` - Set default chat emoji\n" +
        "• `!seticon` - Reply to an image to set group icon",
        threadID, messageID
      );

    } catch (error) {
      Logger.error('SETTINGS_CMD_ERR', 'Error executing settings command:', error.message);
      return api.sendMessage(`❌ Failed to update thread settings: ${error.message}`, threadID, messageID);
    }
  }
};
