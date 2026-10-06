import login from 'fca-unofficial';
import fs from 'fs';
import path from 'path';
import Logger from './logger.js';
import commandLoader from './commandLoader.js';
import runtime from './runtime.js';
import Validator from './validator.js';

/**
 * Bot Manager: Main orchestrator for bot initialization and lifecycle
 */
export class BotManager {
  constructor() {
    this.api = null;
    this.isRunning = false;
    this.appStatePath = path.resolve(process.cwd(), 'appstate.json');
  }

  /**
   * Initialize and start the bot
   */
  async start() {
    try {
      Logger.info('BOT_MANAGER', 'Starting BlueTone Bot...');

      // 1. Validate environment
      if (!Validator.validateEnv()) {
        Logger.error('BOT_MANAGER', 'Environment validation failed');
        process.exit(1);
      }

      // 2. Validate appstate
      if (!Validator.validateAppstate(this.appStatePath)) {
        Logger.error('BOT_MANAGER', 'Appstate validation failed');
        process.exit(1);
      }

      // 3. Load commands
      Logger.info('BOT_MANAGER', 'Loading commands...');
      await commandLoader.loadCommands();

      // 4. Load appstate
      const appState = JSON.parse(fs.readFileSync(this.appStatePath, 'utf8'));

      // 5. Authenticate with Facebook
      Logger.info('BOT_MANAGER', 'Authenticating with Facebook...');
      await this._authenticateWithFacebook(appState);

      this.isRunning = true;
      Logger.info('BOT_MANAGER', '✅ BlueTone Bot is online and ready!');
    } catch (error) {
      Logger.error('BOT_MANAGER', 'Startup failed:', error?.message || error);
      process.exit(1);
    }
  }

  /**
   * Authenticate with Facebook using FCA
   */
  async _authenticateWithFacebook(appState) {
    return new Promise((resolve, reject) => {
      login({ appState }, (err, api) => {
        if (err) {
          Logger.error('BOT_MANAGER', 'Facebook authentication failed:', err?.message || err);
          return reject(err);
        }

        this.api = api;

        // Set API options
        api.setOptions({
          listenEvents: true,
          selfListen: false,
          logLevel: 'silent'
        });

        Logger.info('BOT_MANAGER', 'Logged in to Facebook Messenger');

        // Start listening to MQTT events
        this._startListening();

        resolve(api);
      });
    });
  }

  /**
   * Start MQTT event listener
   */
  _startListening() {
    Logger.info('BOT_MANAGER', 'Starting MQTT listener...');

    this.api.listenMqtt(async (error, event) => {
      if (error) {
        if (error.error === 1357004 || String(error?.message || '').includes('Not logged in')) {
          Logger.warn('BOT_MANAGER', 'MQTT session timeout - reconnecting...');
        } else {
          Logger.error('BOT_MANAGER', 'MQTT error:', error?.message || error);
        }
        return;
      }

      if (!event) return;

      // Route event to runtime handler
      try {
        await runtime.handleEvent(event, this.api);
      } catch (err) {
        Logger.error('BOT_MANAGER', 'Event handling error:', err?.message);
      }
    });
  }

  /**
   * Stop the bot gracefully
   */
  async stop() {
    try {
      Logger.info('BOT_MANAGER', 'Shutting down BlueTone Bot...');

      if (this.api && typeof this.api.logout === 'function') {
        this.api.logout();
      }

      this.isRunning = false;

      Logger.info('BOT_MANAGER', 'BlueTone Bot stopped');
    } catch (error) {
      Logger.error('BOT_MANAGER', 'Shutdown error:', error?.message);
    }
  }

  /**
   * Check if bot is running
   */
  isActive() {
    return this.isRunning;
  }
}

export default new BotManager();
