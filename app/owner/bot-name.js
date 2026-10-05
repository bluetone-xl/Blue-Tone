import { Logger } from '../core/logger.js';

/**
 * Returns the configured default bot name from environment variables or fallback.
 * @returns {string} Cleaned bot name string.
 */
export function getBotName() {
  const name = process.env.BOT_NAME || 'BlueTone Bot';
  return String(name).trim();
}

/**
 * Default fallback bot name constant.
 */
export const botName = getBotName();

export default botName;
