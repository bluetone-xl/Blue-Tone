const config = require('./config');

let defaultPrefix = config.defaultPrefix;

function getDefaultPrefix() {
  return defaultPrefix;
}

function setDefaultPrefix(prefix) {
  const value = String(prefix || '').trim();

  if (!value) {
    throw new Error('Prefix is required');
  }

  if (value.length > 3) {
    throw new Error('Prefix must be 1 to 3 characters');
  }

  if (/\s/.test(value)) {
    throw new Error('Prefix cannot contain spaces');
  }

  defaultPrefix = value;

  return defaultPrefix;
}

module.exports = {
  getDefaultPrefix,
  setDefaultPrefix
};
