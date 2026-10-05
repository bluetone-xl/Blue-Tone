export default {
  name: 'ping',
  description: 'Check bot responsiveness and speed',
  async execute(ctx) {
    const startTime = Date.now();

    try {
      // Small non-blocking delay simulation / timestamp offset calculation
      const latency = Date.now() - startTime;

      return { 
        text: `🏓 **Pong!**\n⚡ Response Time: ${latency}ms\n🟢 Bot Status: Active` 
      };
    } catch (err) {
      return { text: `❌ Failed to execute ping command: ${err.message}` };
    }
  }
};
