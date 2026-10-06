import Logger from '../core/logger.js';

export default {
  name: 'noPrefix',
  description: 'Respond to a plain "prefix" message with the current bot prefix',
  async handle({ api, event }) {
    if (!event || !event.body) return false;

    const message = String(event.body).trim();
    const clean = message.toLowerCase();

    if (clean !== 'prefix') return false;

    const activePrefix = process.env.DEFAULT_PREFIX || process.env.PREFIX || process.env.BOT_PREFIX || '!';

    try {
      await api.sendMessage(
        `📌 Current Bot Prefix: [ ${activePrefix} ]\n💡 Type \`${activePrefix}help\` to view available commands.`,
        event.threadID,
        event.messageID
      );
      return true;
    } catch (error) {
      Logger.error('NO_PREFIX_ERR', 'Failed to send prefix response:', error.message || error);
      return false;
    }
  }
};