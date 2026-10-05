/**
 * Default configuration schema for group settings.
 */
export const DEFAULT_GROUP_SETTINGS = Object.freeze({
  prefix: process.env.DEFAULT_PREFIX || '!',
  memberApproval: false,

  welcome: true,
  leave: true,
  remove: true,

  autoreact: false,

  groupLink: false,

  warningsEnabled: true
});

/**
 * Creates a complete group settings object with optional overrides.
 */
export function createGroupSettings(overrides = {}) {
  return {
    ...DEFAULT_GROUP_SETTINGS,
    ...(overrides && typeof overrides === 'object' ? overrides : {})
  };
}

export default createGroupSettings;
