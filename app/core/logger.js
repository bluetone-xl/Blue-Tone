/**
 * Centralized Logging Utility for BlueTone Bot
 * Enforces structured console outputs and safe error reporting.
 */
export const Logger = {
  /**
   * Logs informational messages.
   * @param {string} scope - Module or component name
   * @param {string} message - Message text
   * @param {...any} args - Additional contextual data
   */
  info(scope, message, ...args) {
    try {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      console.log(`\x1b[36m[${timestamp}] ℹ️ [${scope}]\x1b[0m ${message}`, ...args);
    } catch {
      console.log(`[${scope}] ${message}`);
    }
  },

  /**
   * Logs success events.
   * @param {string} scope 
   * @param {string} message 
   * @param {...any} args 
   */
  success(scope, message, ...args) {
    try {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      console.log(`\x1b[32m[${timestamp}] ✅ [${scope}]\x1b[0m ${message}`, ...args);
    } catch {
      console.log(`[${scope}] ${message}`);
    }
  },

  /**
   * Logs warning messages.
   * @param {string} scope 
   * @param {string} message 
   * @param {...any} args 
   */
  warn(scope, message, ...args) {
    try {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      console.warn(`\x1b[33m[${timestamp}] ⚠️ [${scope}]\x1b[0m ${message}`, ...args);
    } catch {
      console.warn(`[${scope}] ${message}`);
    }
  },

  /**
   * Logs system or runtime errors gracefully.
   * @param {string} scope 
   * @param {string|Error} error 
   * @param {...any} args 
   */
  error(scope, error, ...args) {
    try {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`\x1b[31m[${timestamp}] ❌ [${scope}]\x1b[0m ${errorMessage}`, ...args);
    } catch {
      console.error(`[${scope}] ${error}`);
    }
  }
};

export default Logger;
