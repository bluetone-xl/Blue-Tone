/**
 * Formats command metadata into a clean help object.
 * @param {Object} command 
 * @returns {Object|null}
 */
export function formatCommandHelp(command) {
  try {
    if (!command || typeof command !== 'object') {
      return null;
    }

    return {
      command: command.name ? String(command.name).trim() : 'Unknown',
      description: command.description ? String(command.description).trim() : 'No description provided.',
      usage: command.usage ? String(command.usage).trim() : 'No usage provided.',
      category: command.category ? String(command.category).trim() : 'General',
      permission: command.permission ? String(command.permission).trim() : 'User',
      aliases: Array.isArray(command.aliases) ? command.aliases : []
    };
  } catch (err) {
    console.error('❌ [HelpCore] Error formatting command help:', err.message);
    return null;
  }
}

/**
 * Retrieves help information for a single command or all registered commands.
 * @param {Object} registry - CommandRegistry instance
 * @param {string|null} commandName 
 * @returns {Object|Array|null}
 */
export function getHelp(registry, commandName = null) {
  try {
    if (!registry) {
      console.warn('⚠️ [HelpCore] Command registry is missing or undefined.');
      return commandName ? null : [];
    }

    if (commandName) {
      if (typeof registry.get !== 'function') {
        console.error('❌ [HelpCore] Registry.get is not a valid function.');
        return null;
      }
      const command = registry.get(String(commandName).trim().toLowerCase());
      return formatCommandHelp(command);
    }

    if (typeof registry.list !== 'function' && typeof registry.all !== 'function') {
      console.error('❌ [HelpCore] Registry does not provide list() or all() method.');
      return [];
    }

    const commandList = typeof registry.all === 'function' ? registry.all() : registry.list();
    if (!Array.isArray(commandList)) {
      return [];
    }

    return commandList
      .map(cmd => formatCommandHelp(cmd))
      .filter(cmd => cmd !== null);
  } catch (err) {
    console.error('❌ [HelpCore] Error fetching help information:', err.message);
    return commandName ? null : [];
  }
}

export default {
  formatCommandHelp,
  getHelp
};
