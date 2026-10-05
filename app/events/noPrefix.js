import Logger from '../core/logger.js';

export default {
  name: 'noPrefix',
  description: 'Detects plain text "prefix" messages and responds with the current bot prefix',
  async handle({ api, event }) {
    const { threadID, messageID, body } = event;

    if (!body) return false;

    // Check if the message is exactly "prefix" (case-insensitive)
    const cleanMessage = body.trim().toLowerCase();
    if (cleanMessage === 'prefix') {
      const activePrefix = process.env.BOT_PREFIX || '!';

      const responseText = 
        `📌 Current Bot Prefix: [ ${activePrefix} ]\n` +
        `💡 Type \`${activePrefix}help\` to view available commands.`;

      try {
        await api.sendMessage(responseText, threadID, messageID);
        return true; // Handled
      } catch (error) {
        Logger.error('NO_PREFIX_ERR', 'Failed to send prefix response:', error.message);
      }
    }

    return false; // Not handled
  }
};
