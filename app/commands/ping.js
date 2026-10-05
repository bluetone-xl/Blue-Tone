import { Logger } from '../core/logger.js';

export const pingCommand = {
  name: 'ping',
  aliases: ['p', 'latency'],
  description: 'Checks bot responsiveness and server uptime.',

  async execute({ event, api, prefix }) {
    if (!event || !event.threadID) return;

    try {
      const startTime = Date.now();
      const messageResponse = await api.sendMessage('🏓 Pinging...', event.threadID);
      const latency = Date.now() - startTime;

      const responseText = `🏓 **Pong!**\n⚡ Latency: \`${latency}ms\`\n🟢 Status: Operational`;

      if (messageResponse && messageResponse.messageID) {
        await api.editMessage(responseText, messageResponse.messageID);
      } else {
        await api.sendMessage(responseText, event.threadID);
      }
    } catch (err) {
      Logger.error('PING_CMD', 'Error executing ping command:', err?.message || err);
      await api.sendMessage('❌ Failed to calculate latency.', event.threadID);
    }
  }
};

export default pingCommand;
