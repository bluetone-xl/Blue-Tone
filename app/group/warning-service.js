import { Logger } from '../core/logger.js';

/**
 * Service to manage user warnings and enforce group disciplinary actions.
 */
export class WarningService {
  constructor({ store, capabilities } = {}) {
    this.store = store; // DB or GroupService instance
    this.capabilities = capabilities; // FCA/Messenger instance for actions
    this.maxWarnings = 3;
  }

  /**
   * Issues a warning to a user and executes action if limit is exceeded.
   */
  async issueWarning(groupId, userId, reason = 'No reason provided') {
    if (!groupId || !userId) return null;

    const gId = String(groupId).trim();
    const uId = String(userId).trim();

    try {
      const currentWarnings = this.store?.addWarning 
        ? this.store.addWarning(gId, uId) 
        : 1;

      Logger.info('WARNING_SERVICE', `User ${uId} warned in group ${gId}. Total: ${currentWarnings}`);

      const result = {
        groupId: gId,
        userId: uId,
        count: currentWarnings,
        max: this.maxWarnings,
        exceeded: currentWarnings >= this.maxWarnings,
        reason: String(reason).trim()
      };

      // Auto-kick if maximum warnings reached
      if (result.exceeded && this.capabilities?.removeUserFromGroup) {
        await this.capabilities.removeUserFromGroup(uId, gId);
        this.clearWarnings(gId, uId);
      }

      return result;
    } catch (err) {
      Logger.error('WARNING_SERVICE', `Failed to issue warning to ${uId}:`, err?.message || err);
      return null;
    }
  }

  /**
   * Resets warnings for a specific user in a group.
   */
  clearWarnings(groupId, userId) {
    if (!groupId || !userId) return false;
    
    if (this.store?.clearWarnings) {
      return this.store.clearWarnings(String(groupId).trim(), String(userId).trim());
    }

    return true;
  }
}

export default WarningService;
