/**
 * Parses a message string into a command, arguments array, and raw body.
 * @param {string} message - Incoming message text
 * @param {string} [prefix='!'] - Command prefix
 * @returns {Object|null} Parsed command details or null if invalid/not a command
 */
export function parseCommand(message, prefix = '!') {
  try {
    if (!message || typeof message !== 'string') {
      return null;
    }

    const safePrefix = String(prefix || '!').trim();
    const text = message.trim();

    if (!safePrefix || !text.startsWith(safePrefix)) {
      return null;
    }

    const body = text.slice(safePrefix.length).trim();
    if (!body) {
      return null;
    }

    const parts = body.split(/\s+/);
    const command = parts.shift()?.toLowerCase();

    if (!command) {
      return null;
    }

    return {
      command: String(command).trim(),
      args: parts.map(arg => String(arg).trim()),
      raw: body
    };
  } catch (err) {
    console.error('❌ [ParserCore] Error parsing command:', err.message);
    return null;
  }
}

export default {
  parseCommand
};
