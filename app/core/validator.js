import Logger from './logger.js';

/**
 * Configuration and environment validation
 */
export class Validator {
  /**
   * Validate required environment variables
   */
  static validateEnv() {
    const required = [
      'BOT_OWNER_UID',
      'DEFAULT_PREFIX'
    ];

    const missing = [];

    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      Logger.warn('VALIDATOR', `Missing environment variables: ${missing.join(', ')}`);
      return false;
    }

    Logger.info('VALIDATOR', 'Environment validation passed');
    return true;
  }

  /**
   * Validate appstate.json exists and is valid JSON
   */
  static validateAppstate(appstatePath) {
    try {
      const fs = require('fs');
      if (!fs.existsSync(appstatePath)) {
        Logger.error('VALIDATOR', 'appstate.json file not found');
        return false;
      }

      const data = fs.readFileSync(appstatePath, 'utf-8');
      JSON.parse(data);

      Logger.info('VALIDATOR', 'Appstate validation passed');
      return true;
    } catch (error) {
      Logger.error('VALIDATOR', 'Appstate validation failed:', error?.message);
      return false;
    }
  }

  /**
   * Validate command structure
   */
  static validateCommand(command) {
    if (!command.name || typeof command.name !== 'string') {
      return false;
    }

    if (!command.execute || typeof command.execute !== 'function') {
      return false;
    }

    return true;
  }

  /**
   * Validate event structure
   */
  static validateEvent(event) {
    if (!event || typeof event !== 'object') {
      return false;
    }

    // Check for required event properties
    if (!event.type || !event.threadID || !event.senderID) {
      return false;
    }

    return true;
  }
}

export default Validator;
