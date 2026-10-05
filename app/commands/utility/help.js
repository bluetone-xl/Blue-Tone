export default {
  name: 'help',
  description: 'Show all available commands or specific command info',
  async execute(ctx) {
    const { prefix, runtime, args } = ctx;

    try {
      if (!runtime || !runtime.commands) {
        return { text: '⚠️ Command registry is not available.' };
      }

      // Convert Map or Collection to Array if needed
      const commandsList = Array.isArray(runtime.commands) 
        ? runtime.commands 
        : Array.from(runtime.commands.values());

      const searchCmd = args[0]?.toLowerCase();

      // 1. Show details for a specific command if requested
      if (searchCmd) {
        const targetCmd = commandsList.find(cmd => cmd.name?.toLowerCase() === searchCmd);
        if (!targetCmd) {
          return { text: `❌ Command \`${prefix}${searchCmd}\` not found.` };
        }
        return {
          text: `📖 **Command Information:**\n` +
                `• **Name:** \`${prefix}${targetCmd.name}\`\n` +
                `• **Description:** ${targetCmd.description || 'No description provided.'}`
        };
      }

      // 2. Show general commands list
      let helpText = `🤖 **BlueTone Bot - Command List**\n\n`;

      commandsList.forEach((cmd) => {
        if (cmd && cmd.name) {
          helpText += `🔹 \`${prefix}${cmd.name}\`: ${cmd.description || 'No description'}\n`;
        }
      });

      helpText += `\n👉 Type \`${prefix}help <command_name>\` for specific command info.`;
      return { text: helpText };
    } catch (err) {
      return { text: `❌ Failed to generate help menu: ${err.message}` };
    }
  }
};
