import EventRouter from '../events/router.js';
import ExtensionEventHandler from '../integrations/meta/extension-events.js';
import RateLimiter from '../security/rate-limiter.js';

export class BotRuntime {
  constructor() {
    try {
      this.commands = new Map();
      this.rateLimiter = new RateLimiter();
      
      // Initialize Event Router safely
      this.eventRouter = new EventRouter();
      if (typeof this.eventRouter.setRuntime === 'function') {
        this.eventRouter.setRuntime(this);
      }

      // Initialize Extension Event Handler safely
      this.extensionEvents = new ExtensionEventHandler(this);
    } catch (err) {
      console.error('❌ [BotRuntime] Critical initialization failure:', err.message);
      // Ensure essential properties exist even on setup error
      this.commands = this.commands || new Map();
    }
  }

  /**
   * Registers a command into the runtime command map.
   * @param {Object} command 
   * @returns {boolean}
   */
  registerCommand(command) {
    try {
      if (!command || typeof command !== 'object') {
        console.warn('⚠️ [BotRuntime] Attempted to register an invalid command object.');
        return false;
      }

      const rawName = String(command.name || '').trim().toLowerCase();
      if (!rawName) {
        console.warn('⚠️ [BotRuntime] Command registration failed: Missing or empty command name.');
        return false;
      }

      if (typeof command.execute !== 'function') {
        console.warn(`⚠️ [BotRuntime] Command registration failed: "${rawName}" is missing an execute function.`);
        return false;
      }

      this.commands.set(rawName, command);
      return true;
    } catch (err) {
      console.error('❌ [BotRuntime] Error registering command:', err.message);
      return false;
    }
  }

  /**
   * Clears registered commands or runtime cache safely.
   */
  clearCommands() {
    try {
      this.commands.clear();
    } catch (err) {
      console.error('❌ [BotRuntime] Error clearing runtime commands:', err.message);
    }
  }
}

export default BotRuntime;
