import EventRouter from '../events/router.js';
import ExtensionEventHandler from '../integrations/meta/extension-events.js';
import RateLimiter from '../security/rate-limiter.js';

export class BotRuntime {
  constructor() {
    this.commands = new Map();
    this.rateLimiter = new RateLimiter();
    
    // Initialize Event Router
    this.eventRouter = new EventRouter();
    this.eventRouter.setRuntime(this);

    // Initialize Extension Event Handler
    this.extensionEvents = new ExtensionEventHandler(this);
  }

  registerCommand(command) {
    if (!command.name || typeof command.execute !== 'function') {
      throw new Error('Invalid command registration');
    }
    this.commands.set(command.name.toLowerCase(), command);
  }
}

export default BotRuntime;
