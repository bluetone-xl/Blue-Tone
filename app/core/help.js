function formatCommandHelp(command) {
  if (!command) {
    return null;
  }

  return {
    command: command.name,
    description: command.description,
    usage: command.usage,
    category: command.category,
    permission: command.permission,
    aliases: command.aliases
  };
}

function getHelp(registry, commandName = null) {
  if (!registry) {
    throw new Error('Command registry is required');
  }

  if (commandName) {
    const command = registry.get(commandName);
    return formatCommandHelp(command);
  }

  return registry.list().map(formatCommandHelp);
}

module.exports = {
  formatCommandHelp,
  getHelp
};
