import { Logger } from '../../core/logger.js';

/**
 * Adapter providing a clean abstraction over raw FCA/Facebook API operations.
 */
export class MessengerAdapter {
  constructor(api = null) {
    this.api = api;
  }

  /**
   * Updates the underlying FCA API instance.
   */
  setApi(api) {
    this.api = api;
  }

  /**
   * Sends a text message or payload to a specific thread.
   */
  async sendMessage(threadId, messagePayload) {
    if (!this.api) {
      Logger.warn('MESSENGER_ADAPTER', 'Cannot send message: API instance not set');
      return null;
    }

    const tId = String(threadId).trim();

    return new Promise((resolve) => {
      this.api.sendMessage(messagePayload, tId, (err, info) => {
        if (err) {
          Logger.error('MESSENGER_ADAPTER', `Failed to send message to ${tId}:`, err?.message || err);
          return resolve(null);
        }
        resolve(info);
      });
    });
  }

  /**
   * Sets an emoji reaction on a specific message.
   */
  async setReaction(messageId, emoji = '🍒') {
    if (!this.api || !messageId) return false;

    return new Promise((resolve) => {
      this.api.setMessageReaction(String(emoji), String(messageId).trim(), (err) => {
        if (err) {
          Logger.error('MESSENGER_ADAPTER', `Failed to react to message ${messageId}:`, err?.message || err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  /**
   * Removes a user from a group thread.
   */
  async removeUserFromGroup(userId, threadId) {
    if (!this.api || !userId || !threadId) return false;

    return new Promise((resolve) => {
      this.api.removeUserFromGroup(String(userId).trim(), String(threadId).trim(), (err) => {
        if (err) {
          Logger.error('MESSENGER_ADAPTER', `Failed to remove user ${userId} from group ${threadId}:`, err?.message || err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  /**
   * Adds a user to a group thread.
   */
  async addUserToGroup(userId, threadId) {
    if (!this.api || !userId || !threadId) return false;

    return new Promise((resolve) => {
      this.api.addUserToGroup(String(userId).trim(), String(threadId).trim(), (err) => {
        if (err) {
          Logger.error('MESSENGER_ADAPTER', `Failed to add user ${userId} to group ${threadId}:`, err?.message || err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  /**
   * Fetches thread details for a specific group or direct chat.
   */
  async getThreadInfo(threadId) {
    if (!this.api || !threadId) return null;

    return new Promise((resolve) => {
      this.api.getThreadInfo(String(threadId).trim(), (err, info) => {
        if (err) {
          Logger.error('MESSENGER_ADAPTER', `Failed to fetch thread info for ${threadId}:`, err?.message || err);
          return resolve(null);
        }
        resolve(info);
      });
    });
  }
}

export default MessengerAdapter;
