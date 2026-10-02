export default {
  name: 'ping',
  description: 'Check bot responsiveness and speed',
  async execute(ctx) {
    const start = Date.now();
    const latency = Date.now() - start;
    return { text: `🏓 **Pong!**\n⚡ Latency: ${latency}ms\n🟢 Bot Status: Active` };
  }
};
