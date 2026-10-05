import permissions from '../security/permissions.js';
import botConfig from '../config/botConfig.js';

export default {
  name: 'owner',
  description: 'Shows bot owner info and allows owner to update social media links.',
  category: 'utility',
  aliases: ['social', 'socials'],
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID } = event;

    // Command to set socials (Owner Only): !owner set facebook https://...
    if (args[0] && args[0].toLowerCase() === 'set') {
      if (!permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Only the Bot Owner can set social links.', threadID, messageID);
      }

      const platform = args[1];
      const url = args[2];

      if (!platform || !url) {
        return api.sendMessage('💡 Usage: `!owner set <facebook|github|telegram|whatsapp> <link>`', threadID, messageID);
      }

      botConfig.setSocial(platform, url);
      return api.sendMessage(`✅ Successfully updated ${platform} link!`, threadID, messageID);
    }

    // Default view for everyone: !owner
    const socials = botConfig.getSocials();
    const infoMsg = 
      `👑 [BOT OWNER INFO]\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 Owner: BlueTone Admin\n\n` +
      `🔗 Social Links:\n` +
      `• Facebook: ${socials.facebook || 'Not set'}\n` +
      `• GitHub: ${socials.github || 'Not set'}\n` +
      `• Telegram: ${socials.telegram || 'Not set'}\n` +
      `• WhatsApp: ${socials.whatsapp || 'Not set'}\n\n` +
      `💡 Owner command to update: \n\`!owner set <platform> <link>\``;

    return api.sendMessage(infoMsg, threadID, messageID);
  }
};
