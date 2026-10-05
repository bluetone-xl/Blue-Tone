import config from './config.js';

let defaultPrefix = config?.defaultPrefix || '!';

/**
 * Gets the current default global prefix.
 * @returns {string}
 */
export function getDefaultPrefix() {
  try {
    return defaultPrefix;
  } catch (err) {
    console.error('❌ [GlobalPrefix] Error fetching default prefix:', err.message);
    return '!';
  }
}

/**
 * Sets a new default global prefix safely.
 * @param {string} prefix 
 * @returns {string} The updated prefix or current prefix if invalid.
 */
export function setDefaultPrefix(prefix) {
  try {
    const value = String(prefix || '').trim();

    if (!value) {
      throw new Error('Prefix is required and cannot be empty.');
    }

    if (value.length > 3) {
      throw new Error('Prefix must be between 1 and 3 characters.');
    }

    if (/\s/.test(value)) {
      throw new Error('Prefix cannot contain spaces.');
    }

    defaultPrefix = value;
    return defaultPrefix;
  } catch (err) {
    console.error('❌ [GlobalPrefix] Failed to set default prefix:', err.message);
    // Return existing prefix on validation failure without crashing process
    return defaultPrefix;
  }
}

export default {
  getDefaultPrefix,
  setDefaultPrefix
};
