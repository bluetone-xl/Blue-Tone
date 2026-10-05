import { Logger } from '../core/logger.js';
import groupSelectionStore from './selection.js';

/**
 * Resolves the target threadId for management actions based on message context
 * or admin's active group selection store.
 *
 * @param {Object} context - The incoming event or command context.
 * @param {Object} [selectionStore] - Optional selection store instance (defaults to singleton).
 * @returns {string|null} The resolved threadId or null.
 */
export function resolveManagementTarget(context = {}, selectionStore = groupSelectionStore) {
  try {
    // 1. Direct threadId/groupId from current message context
    const contextTarget = context?.threadId || context?.groupId;
    if (contextTarget) {
      return String(contextTarget).trim();
    }

    // 2. Active selection set by admin/user in memory store
    const senderId = context?.senderId || context?.userId || context?.author;
    if (senderId && selectionStore && typeof selectionStore.getSelection === 'function') {
      const selectedThreadId = selectionStore.getSelection(senderId);
      if (selectedThreadId) {
        return String(selectedThreadId).trim();
      }
    }

    Logger.warn('TARGET_RESOLVER', 'Could not resolve any active target thread');
    return null;
  } catch (error) {
    Logger.error('TARGET_RESOLVER', 'Error resolving target thread:', error?.message || error);
    return null;
  }
}

export default {
  resolveManagementTarget
};
