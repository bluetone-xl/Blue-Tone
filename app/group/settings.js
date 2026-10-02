const DEFAULT_GROUP_SETTINGS = Object.freeze({
  prefix: '!',
  memberApproval: false,

  welcome: true,
  leave: true,
  remove: true,

  autoreact: false,

  groupLink: false,

  warningsEnabled: true
});

function createGroupSettings(overrides = {}) {
  return {
    ...DEFAULT_GROUP_SETTINGS,
    ...overrides
  };
}

module.exports = {
  DEFAULT_GROUP_SETTINGS,
  createGroupSettings
};
