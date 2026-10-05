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
    try {
      const safeInitial = typeof initial === 'object' && initial !== null ? initial : {};
      this.capabilities = {
        ...DEFAULT_CAPABILITIES,
        ...safeInitial
      };
    } catch (err) {
      console.error('❌ [CapabilityRegistry] Constructor initialization failed:', err.message);
      this.capabilities = { ...DEFAULT_CAPABILITIES };
    }
  }

  /**
   * Checks if a capability is supported and enabled.
   * @param {string} name 
   * @returns {boolean}
   */
  isSupported(name) {
    try {
      if (!name) return false;
      return this.capabilities[String(name).trim()] === true;
    } catch (err) {
      console.error('❌ [CapabilityRegistry] Error in isSupported:', err.message);
      return false;
    }
  }

  /**
   * Sets the capability state safely.
   * @param {string} name 
   * @param {boolean} supported 
   * @returns {boolean}
   */
  set(name, supported) {
    try {
      if (!name) throw new Error('Capability name is required.');
      const key = String(name).trim();

      if (!(key in this.capabilities)) {
        throw new Error(`Unknown capability key: ${key}`);
      }

      this.capabilities[key] = Boolean(supported);
      return this.capabilities[key];
    } catch (err) {
      console.error('❌ [CapabilityRegistry] Failed to set capability:', err.message);
      return false;
    }
  }

  /**
   * Gets the value of a capability.
   * @param {string} name 
   * @returns {boolean}
   */
  get(name) {
    try {
      if (!name) return false;
      return this.capabilities[String(name).trim()] ?? false;
    } catch (err) {
      console.error('❌ [CapabilityRegistry] Error in get capability:', err.message);
      return false;
    }
  }

  /**
   * Returns a copy of all capabilities.
   * @returns {Object}
   */
  all() {
    try {
      return { ...this.capabilities };
    } catch (err) {
      console.error('❌ [CapabilityRegistry] Error fetching all capabilities:', err.message);
      return { ...DEFAULT_CAPABILITIES };
    }
  }
}

export default {
  DEFAULT_CAPABILITIES,
  CapabilityRegistry
};
