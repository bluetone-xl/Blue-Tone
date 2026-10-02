export default {
  name: 'help',
  description: 'Show all available commands',
  async execute(ctx) {
    const { prefix, runtime } = ctx;
    
    if (!runtime || !runtime.commands) {
      return { text: '⚠️ Command registry is not available.' };
    }

    let helpText = `🤖 **BlueTone Bot - Command List**\n\n`;
    
    runtime.commands.forEach((cmd) => {
      helpText += `🔹 \`${prefix}${cmd.name}\`: ${cmd.description || 'No description'}\n`;
    });

    helpText += `\nType \`${prefix}<command>\` to execute.`;
    return { text: helpText };
  }
};
