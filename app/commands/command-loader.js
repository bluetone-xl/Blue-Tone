import { Logger } from '../core/logger.js';

/**
 * Command Loader & Registry for dynamically registering and executing bot commands.
 */
export class CommandLoader {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.prefix = process.env.BOT_PREFIX || '!';
  }

  /**
   * Registers a single command module into memory.
   */
  registerCommand(commandModule) {
    if (!commandModule || !commandModule.name) {
      Logger.warn('COMMAND_LOADER', 'Invalid command module provided');
      return false;
    }

    const name = commandModule.name.toLowerCase().trim();
    this.commands.set(name, commandModule);

    if (Array.isArray(commandModule.aliases)) {
      commandModule.aliases.forEach(alias => {
        this.aliases.set(alias.toLowerCase().trim(), name);
      });
    }

    Logger.info('COMMAND_LOADER', `Registered command: ${name}`);
    return true;
  }

  /**
   * Resolves command name from direct name or alias.
   */
  resolveCommandName(input) {
    if (!input) return null;
    const cleanInput = input.toLowerCase().trim();
    return this.commands.has(cleanInput)
      ? cleanInput
      : this.aliases.get(cleanInput) || null;
  }

  /**
   * Parses message content and executes matching command if prefix exists.
   */
  async handleMessage(event, api) {
    if (!event || !event.body) return false;

    const message = event.body.trim();
    if (!message.startsWith(this.prefix)) return false;

    const args = message.slice(this.prefix.length).trim().split(/\s+/);
    const commandNameInput = args.shift();
    const resolvedName = this.resolveCommandName(commandNameInput);

    if (!resolvedName) return false;

    const command = this.commands.get(resolvedName);
    try {
      Logger.info('COMMAND_LOADER', `Executing command [${resolvedName}] for thread ${event.threadID}`);
      await command.execute({ event, api, args, prefix: this.prefix });
      return true;
    } catch (err) {
      Logger.error('COMMAND_LOADER', `Error executing command [${resolvedName}]:`, err?.message || err);
      if (api && typeof api.sendMessage === 'function') {
        await api.sendMessage(`❌ Error executing command: ${err.message || 'Unknown error'}`, event.threadID);
      }
      return false;
    }
  }
}

export const commandLoader = new CommandLoader();
export default commandLoader;
