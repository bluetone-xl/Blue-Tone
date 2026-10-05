import { Logger } from '../core/logger.js';
import groupService from '../group/group-service.js';

/**
 * Handles real-time group lifecycle events such as member joins, leaves, and kicks.
 */
export class GroupEvents {
  constructor({ service = groupService } = {}) {
    this.service = service;
  }

  /**
   * Triggered when one or more members join or are added to a group thread.
   *
   * @param {string} threadId - The group thread ID.
   * @param {Array<Object>} addedParticipants - Array of added user objects containing userFbId and fullName.
   * @param {Object} api - FCA messenger client instance.
   */
  async handleMemberJoin(threadId, addedParticipants = [], api = null) {
    if (!threadId || !Array.isArray(addedParticipants) || addedParticipants.length === 0) {
      return false;
    }

    try {
      const cleanThreadId = String(threadId).trim();
      Logger.info('GROUP_EVENTS', `Processing member join event for thread: ${cleanThreadId}`);

      for (const participant of addedParticipants) {
        const userId = String(participant.userFbId || participant.id || '').trim();
        const userName = participant.fullName || 'New Member';

        // Register member in persistent database store
        if (this.service && typeof this.service.addMember === 'function') {
          await this.service.addMember(cleanThreadId, userId, { name: userName });
        }

        // Send Welcome Message if API client is supplied
        if (api && typeof api.sendMessage === 'function') {
          const welcomeText = `Welcome ${userName} to the group! 🎉\nPlease follow the group rules.`;
          await api.sendMessage(welcomeText, cleanThreadId);
        }
      }

      return true;
    } catch (err) {
      Logger.error('GROUP_EVENTS', 'Error handling member join event:', err?.message || err);
      return false;
    }
  }

  /**
   * Triggered when a member leaves or is removed from a group thread.
   *
   * @param {string} threadId - The group thread ID.
   * @param {string} leftParticipantFbId - The Facebook user ID of the departing member.
   * @param {Object} api - FCA messenger client instance.
   */
  async handleMemberLeave(threadId, leftParticipantFbId, api = null) {
    if (!threadId || !leftParticipantFbId) return false;

    try {
      const cleanThreadId = String(threadId).trim();
      const cleanUserId = String(leftParticipantFbId).trim();

      Logger.info('GROUP_EVENTS', `User ${cleanUserId} left or was removed from thread: ${cleanThreadId}`);

      // Unregister member from persistent database store
      if (this.service && typeof this.service.removeMember === 'function') {
        await this.service.removeMember(cleanThreadId, cleanUserId);
      }

      // Send goodbye/leave alert if API client is available
      if (api && typeof api.sendMessage === 'function') {
        const leaveText = `Member (${cleanUserId}) has left the group. 🚪`;
        await api.sendMessage(leaveText, cleanThreadId);
      }

      return true;
    } catch (err) {
      Logger.error('GROUP_EVENTS', 'Error handling member leave event:', err?.message || err);
      return false;
    }
  }
}

export const groupEvents = new GroupEvents();
export default groupEvents;
