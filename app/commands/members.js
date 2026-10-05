import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'members',
  description: 'Displays user profile info, current prefix, or list of members in the group',
  category: 'general',
  aliases: ['profile', 'prefix', 'memberlist'],
  async execute({ api, event, args }) {
    const { threadID, senderID, messageID, mentions } = event;
    const globalPrefix = process.env.BOT_PREFIX || '!';

    try {
      // কমান্ডটি কীভাবে ডাকা হয়েছে তা চেক করা (যেমন: !profile, !prefix, নাকি !members)
      const commandTrigger = event.body.substring(1).split(' ')[0].toLowerCase();

      // -------------------------------------------------------------
      // 1. PROFILE CHECK (`!profile` or `!members profile`)
      // -------------------------------------------------------------
      if (commandTrigger === 'profile' || args[0] === 'profile') {
        let targetUid = senderID;

        if (mentions && Object.keys(mentions).length > 0) {
          targetUid = Object.keys(mentions)[0];
        } else if (args[0] === 'profile' && args[1] && !isNaN(args[1])) {
          targetUid = args[1];
        } else if (args[0] && !isNaN(args[0])) {
          targetUid = args[0];
        }

        const userInfo = await api.getUserInfo(targetUid);
        const user = userInfo[targetUid] || {};

        const name = user.name || 'Facebook User';
        const isOwner = Permissions.isOwner(targetUid);
        const role = isOwner ? 'BOT OWNER 👑' : 'MEMBER 👤';

        const profileMsg = 
          `👤 User Profile Information\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `• Name: ${name}\n` +
          `• UID: ${targetUid}\n` +
          `• Role: ${role}\n` +
          `• Profile Link: https://facebook.com/${targetUid}`;

        return api.sendMessage(profileMsg, threadID, messageID);
      }

      // -------------------------------------------------------------
      // 2. PREFIX CHECK (`!prefix` or `!members prefix`)
      // -------------------------------------------------------------
      if (commandTrigger === 'prefix' || args[0] === 'prefix') {
        const prefixMsg = 
          `📌 Prefix Information\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `• Current Active Prefix: [ ${globalPrefix} ]\n` +
          `• Global Default Prefix: [ ! ]\n\n` +
          `💡 Type \`${globalPrefix}help\` to see available commands.`;

        return api.sendMessage(prefixMsg, threadID, messageID);
      }

      // -------------------------------------------------------------
      // 3. FULL MEMBER LIST (`!members` or `!members uid`)
      // -------------------------------------------------------------
      const threadInfo = await api.getThreadInfo(threadID);
      if (!threadInfo || !threadInfo.participantIDs) {
        return api.sendMessage('❌ Unable to fetch group member list.', threadID, messageID);
      }

      const showUid = args[0] && (args[0].toLowerCase() === 'uid' || args[0].toLowerCase() === '-u');
      const participantIDs = threadInfo.participantIDs;

      let listMsg = `👥 Group Member List (${participantIDs.length} Total)\n━━━━━━━━━━━━━━━━━━\n`;
      const userInfoMap = await api.getUserInfo(participantIDs);

      participantIDs.forEach((id, index) => {
        const uName = userInfoMap[id] ? userInfoMap[id].name : 'Facebook User';
        if (showUid) {
          listMsg += `${index + 1}. ${uName} [${id}]\n`;
        } else {
          listMsg += `${index + 1}. ${uName}\n`;
        }
      });

      listMsg += `\n💡 Usage Tips:\n• \`!profile @mention\` - View profile\n• \`!prefix\` - Check prefix`;

      return api.sendMessage(listMsg, threadID, messageID);

    } catch (error) {
      Logger.error('MEMBERS_CMD_ERR', 'Error executing member command:', error.message);
      return api.sendMessage(`❌ Command failed: ${error.message}`, threadID, messageID);
    }
  }
};
