import { Logger } from '../../core/logger.js';

/**
 * Service responsible for synchronizing and verifying FCA/Meta adapter capabilities.
 */
export class CapabilitySync {
  constructor({ adapter, registry } = {}) {
    this.adapter = adapter || null;
    this.registry = registry || null;
    this.syncedCapabilities = new Set();
    this.lastSyncedAt = null;
  }

  /**
   * Synchronizes available adapter capabilities with the global registry.
   */
  async sync() {
    if (!this.adapter) {
      Logger.warn('CAPABILITY_SYNC', 'Sync skipped: Meta/FCA adapter is not initialized');
      return false;
    }

    try {
      // Extract available feature flags/methods from adapter
      const detectedCapabilities = this._detectCapabilities(this.adapter);

      this.syncedCapabilities.clear();
      for (const capability of detectedCapabilities) {
        this.syncedCapabilities.add(capability);
      }

      this.lastSyncedAt = new Date();

      // Register with global capability registry if available
      if (this.registry && typeof this.registry.registerCapabilities === 'function') {
        await this.registry.registerCapabilities('meta', Array.from(this.syncedCapabilities));
      }

      Logger.info(
        'CAPABILITY_SYNC',
        `Successfully synced ${this.syncedCapabilities.size} Meta adapter capabilities`
      );

      return true;
    } catch (err) {
      Logger.error('CAPABILITY_SYNC', 'Failed to sync adapter capabilities:', err?.message || err);
      return false;
    }
  }

  /**
   * Helper to detect supported API actions from adapter instance.
   */
  _detectCapabilities(adapter) {
    const capabilities = [];

    // Core FCA Messaging capabilities
    if (typeof adapter.sendMessage === 'function') capabilities.push('send_message');
    if (typeof adapter.sendAttachment === 'function') capabilities.push('send_attachment');
    if (typeof adapter.setMessageReaction === 'function') capabilities.push('set_reaction');
    if (typeof adapter.unsendMessage === 'function') capabilities.push('unsend_message');

    // Group Management capabilities
    if (typeof adapter.removeUserFromGroup === 'function') capabilities.push('remove_user');
    if (typeof adapter.addUserToGroup === 'function') capabilities.push('add_user');
    if (typeof adapter.changeAdminStatus === 'function') capabilities.push('change_admin');
    if (typeof adapter.changeGroupTitle === 'function') capabilities.push('change_title');
    if (typeof adapter.changeThreadColor === 'function') capabilities.push('change_color');

    // Thread & User Info capabilities
    if (typeof adapter.getThreadInfo === 'function') capabilities.push('get_thread_info');
    if (typeof adapter.getUserInfo === 'function') capabilities.push('get_user_info');

    return capabilities;
  }

  /**
   * Checks if a specific capability is active and supported.
   */
  hasCapability(capabilityName) {
    if (!capabilityName) return false;
    return this.syncedCapabilities.has(String(capabilityName).trim());
  }

  /**
   * Returns a list of all currently synced capabilities.
   */
  list() {
    return Array.from(this.syncedCapabilities);
  }
}

export default CapabilitySync;
