import { Logger } from '../core/logger.js';

/**
 * In-memory store to manage admin/user active target thread selections.
 */
export class GroupSelectionStore {
  constructor() {
    // Map<userId, { threadId: string, selectedAt: Date }>
    this.selections = new Map();
  }

  /**
   * Sets or updates the active selected thread for a specific user.
   */
  setSelection(userId, threadId) {
    if (!userId || !threadId) {
      Logger.warn('SELECTION_STORE', 'Failed to set selection: userId or threadId missing');
      return false;
    }

    const uId = String(userId).trim();
    const tId = String(threadId).trim();

    this.selections.set(uId, {
      threadId: tId,
      selectedAt: new Date()
    });

    Logger.info('SELECTION_STORE', `User ${uId} selected thread ${tId}`);
    return true;
  }

  /**
   * Retrieves the currently selected threadId for a user.
   */
  getSelection(userId) {
    if (!userId) return null;
    const uId = String(userId).trim();
    const record = this.selections.get(uId);

    return record ? record.threadId : null;
  }

  /**
   * Checks if a user has an active group selection.
   */
  hasSelection(userId) {
    if (!userId) return false;
    return this.selections.has(String(userId).trim());
  }

  /**
   * Clears the current selection for a user.
   */
  clearSelection(userId) {
    if (!userId) return false;
    const uId = String(userId).trim();
    const deleted = this.selections.delete(uId);

    if (deleted) {
      Logger.info('SELECTION_STORE', `Cleared selection for user ${uId}`);
    }
    return deleted;
  }

  /**
   * Clears all selections in the store.
   */
  clearAll() {
    this.selections.clear();
    Logger.info('SELECTION_STORE', 'All selections cleared');
  }
}

export const groupSelectionStore = new GroupSelectionStore();
export default groupSelectionStore;
