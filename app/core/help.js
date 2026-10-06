export default {
  name: 'help',
  aliases: ['h', '?'],
  description: 'Show a list of all available commands',

  async execute({ api, event, commandLoader }) {
    const commands = commandLoader
      .getAllCommands()
      .map((cmd) => cmd.name)
      .sort();

    const response = commands.length
      ? `📖 Available Commands:\n${commands.map((cmd) => `• ${cmd}`).join('\n')}`
      : '📖 No commands are currently registered.';

    await api.sendMessage(response, event.threadID, event.messageID);
  }
};