export const DEFAULT_CAPABILITIES = Object.freeze({
  sendMessage: false,
  sendMedia: false,
  reactToMessage: false,
  addMember: false,
  removeMember: false,
  approveMember: false,
  changeNickname: false,
  changeGroupName: false,
  changeGroupPhoto: false,
  readGroupEvents: false,
  botProfileUpdate: false
});

export class CapabilityRegistry {
  constructor(initial = {}) {
    this.capabilities = {
      ...DEFAULT_CAPABILITIES,
      ...initial
    };
  }

  isSupported(name) {
    return this.capabilities[String(name)] === true;
  }

  set(name, supported) {
    const key = String(name);

    if (!(key in this.capabilities)) {
      throw new Error(`Unknown capability: ${key}`);
    }

    this.capabilities[key] = Boolean(supported);

    return this.capabilities[key];
  }

  get(name) {
    return this.capabilities[String(name)] ?? false;
  }

  all() {
    return { ...this.capabilities };
  }
}

export default {
  DEFAULT_CAPABILITIES,
  CapabilityRegistry
};
