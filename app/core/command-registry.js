/**
 * CommandRegistry manages the registration and lookup of executable bot commands.
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  /**
   * Registers a command into the map.
   * @param {Object} command 
   * @returns {boolean} True if registered successfully, false otherwise.
   */
  register(command) {
    try {
      if (!command || typeof command !== 'object') {
        console.warn('⚠️ [CommandRegistry] Attempted to register an invalid command object.');
        return false;
      }

      const name = String(command.name || '').trim().toLowerCase();
      if (!name) {
        console.warn('⚠️ [CommandRegistry] Command missing a valid "name" property.');
        return false;
      }

      this.commands.set(name, command);

      // Register aliases if defined
      if (Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => {
          const aliasName = String(alias || '').trim().toLowerCase();
          if (aliasName) {
            this.commands.set(aliasName, command);
          }
        });
      }

      return true;
    } catch (err) {
      console.error('❌ [CommandRegistry] Error registering command:', err.message);
      return false;
    }
  }

  /**
   * Fetches a registered command by its name or alias.
   * @param {string} name 
   * @returns {Object|undefined}
   */
  get(name) {
    try {
      if (!name) return undefined;
      const key = String(name).trim().toLowerCase();
      return this.commands.get(key);
    } catch (err) {
      console.error('❌ [CommandRegistry] Error getting command:', err.message);
      return undefined;
    }
  }

  /**
   * Returns all unique registered commands.
   * @returns {Array<Object>}
   */
  all() {
    try {
      return Array.from(new Set(this.commands.values()));
    } catch (err) {
      console.error('❌ [CommandRegistry] Error listing all commands:', err.message);
      return [];
    }
  }
}

export default CommandRegistry;
