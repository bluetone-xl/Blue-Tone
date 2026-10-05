/**
 * Centralized Logger module for standardizing system-wide console output.
 */
export class Logger {
  static info(tag, message, ...args) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [${tag}]`, message, ...args);
  }

  static warn(tag, message, ...args) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${tag}]`, message, ...args);
  }

  static error(tag, message, ...args) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${tag}]`, message, ...args);
  }

  static debug(tag, message, ...args) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] [DEBUG] [${tag}]`, message, ...args);
    }
  }
}

export default Logger;
