import Logger from '../core/logger.js';

export default {
  name: 'stats',
  aliases: ['botstats', 'status', 'uptime'],
  description: 'Displays current bot performance, memory usage, and uptime.',
  role: 'user', // Anyone can run this command

  async execute({ api, event }) {
    try {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = process.memoryUsage();
      const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

      const message = 
`📊 ── [ ${process.env.BOT_NAME || 'BlueTone Bot'} Stats ] ── 📊

⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
💾 Memory Used: ${heapUsedMB} MB
🖥️ Total Allocated: ${rssMB} MB
⚙️ Environment: ${process.env.NODE_ENV || 'development'}
⚡ Status: Active & Operational

───────────────────────`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      Logger.error('CMD_STATS_ERR', `Failed to render stats: ${error.message}`);
      return api.sendMessage('❌ Failed to retrieve bot statistics.', event.threadID, event.messageID);
    }
  }
};
