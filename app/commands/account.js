import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'account',
  description: 'Manage bot account profile (PFP, Cover, Bio, Posts) (Owner Only)',
  category: 'owner',
  ownerOnly: true,
  aliases: ['setpfp', 'setcover', 'setbio', 'post'],
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID, type, messageReply } = event;

    try {
      // Access Control: Strict Owner Check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Restricted to Bot Owner.', threadID, messageID);
      }

      const action = args[0] ? args[0].toLowerCase() : null;

      // -------------------------------------------------------------
      // 1. UPDATE BIO (`!account bio <text>`)
      // -------------------------------------------------------------
      if (action === 'bio') {
        const bioText = args.slice(1).join(' ');
        if (!bioText) {
          return api.sendMessage('⚠️ Please provide the new bio text.', threadID, messageID);
        }

        await api.changeBio(bioText);
        return api.sendMessage(`✅ [BIO UPDATED]\n"${bioText}"`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // 2. CREATE POST (`!account post <text>`)
      // -------------------------------------------------------------
      if (action === 'post') {
        const postContent = args.slice(1).join(' ');
        
        let attachmentStream = null;
        if (type === 'message_reply' && messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
          // Reply with image attached logic can be linked here
        }

        if (!postContent && !attachmentStream) {
          return api.sendMessage('⚠️ Please provide caption text or reply to an image to post.', threadID, messageID);
        }

        await api.createPost({ body: postContent });
        return api.sendMessage('✅ [POST CREATED] Successfully published new Facebook post!', threadID, messageID);
      }

      // -------------------------------------------------------------
      // 3. UPDATE PROFILE PICTURE (`!account pfp`) - Reply to image
      // -------------------------------------------------------------
      if (action === 'pfp' || action === 'avatar') {
        if (type !== 'message_reply' || !messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
          return api.sendMessage('⚠️ Please reply to an image message with `!account pfp`.', threadID, messageID);
        }

        const photoUrl = messageReply.attachments[0].url;
        if (!photoUrl) {
          return api.sendMessage('❌ Could not extract photo URL from the replied message.', threadID, messageID);
        }

        await api.changeAvatar(photoUrl);
        return api.sendMessage('✅ [AVATAR UPDATED] Bot profile picture updated successfully!', threadID, messageID);
      }

      // Default Usage Guide
      return api.sendMessage(
        "👤 Account Management Commands (Owner Only):\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "• `!account bio <text>` - Change bot profile bio\n" +
        "• `!account pfp` - Reply to an image to set profile picture\n" +
        "• `!account post <text>` - Publish a new post on account timeline",
        threadID, messageID
      );

    } catch (error) {
      Logger.error('ACCOUNT_CMD_ERR', 'Error executing account command:', error.message);
      return api.sendMessage(`❌ Account management operation failed: ${error.message}`, threadID, messageID);
    }
  }
};
