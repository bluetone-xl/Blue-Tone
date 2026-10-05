import { Logger } from './logger.js';
import db from './database.js';
import sessionManager from '../integrations/meta/session-manager.js';
import FBClient from '../integrations/meta/fb-client.js';
import MessengerAdapter from '../integrations/meta/messenger-adapter.js';
import EventListener from '../integrations/meta/event-listener.js';

/**
 * Main Application Runtime Kernel orchestrating services, databases, and FB clients.
 */
export class Runtime {
  constructor() {
    this.db = db;
    this.sessionManager = sessionManager;
    this.messenger = new MessengerAdapter();
    this.fbClient = null;
    this.eventListener = null;
    this.isReady = false;
  }

  /**
   * Initializes all core systems and starts the Meta integration client.
   */
  async boot(eventRouter = null, groupEvents = null) {
    try {
      Logger.info('RUNTIME', 'Booting BlueTone Bot system kernel...');

      // 1. Initialize persistent storage
      await this.db.init();

      // 2. Setup event router & listener middleware
      this.eventListener = new EventListener({ eventRouter, groupEvents });

      // 3. Initialize FB Client with login listener wrapper
      this.fbClient = new FBClient({
        sessionManager: this.sessionManager,
        onEvent: async (event, api) => {
          if (!this.messenger.api) {
            this.messenger.setApi(api);
          }
          await this.eventListener.handleEvent(event, api);
        }
      });

      // 4. Authenticate and start MQTT listener
      const loginSuccess = await this.fbClient.login();
      if (!loginSuccess) {
        Logger.error('RUNTIME', 'Kernel boot failed: Unable to establish Facebook connection.');
        return false;
      }

      this.isReady = true;
      Logger.info('RUNTIME', 'BlueTone Bot System Kernel initialized successfully!');
      return true;
    } catch (err) {
      Logger.error('RUNTIME', 'Fatal error during system boot:', err?.message || err);
      return false;
    }
  }

  /**
   * Gracefully shuts down bot runtime and preserves session state.
   */
  async shutdown() {
    Logger.info('RUNTIME', 'Shutting down system kernel...');
    if (this.fbClient) {
      await this.fbClient.logout();
    }
    this.isReady = false;
    Logger.info('RUNTIME', 'System kernel offline.');
  }
}

export const runtime = new Runtime();
export default runtime;
