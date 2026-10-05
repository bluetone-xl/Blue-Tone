import db from '../database/connection.js';

/**
 * GroupEventHandler manages member join and leave event notifications.
 */
export class GroupEventHandler {
  /**
   * Handles member join events and generates welcome messages.
   * @param {Object} data 
   * @returns {Promise<Object>} { text: string }
   */
  async handleMemberJoin(data = {}) {
    try {
      const groupId = data?.groupId ?? data?.threadId ?? null;
      const joinedUids = Array.isArray(data?.joinedUids) ? data.joinedUids : [];

      const safeGroupId = groupId ? String(groupId).trim() : null;
      const uidList = joinedUids.length > 0 
        ? joinedUids.map(uid => String(uid).trim()).filter(Boolean).join(', ')
        : 'New Member';

      let msgTemplate = '👋 Welcome {name} to {group}!';

      if (safeGroupId) {
        try {
          const res = await db.query('SELECT welcome_msg FROM groups WHERE thread_id = $1;', [safeGroupId]);
          if (res?.rows?.[0]?.welcome_msg) {
            msgTemplate = String(res.rows[0].welcome_msg);
          }
        } catch (dbErr) {
          console.error('❌ [GroupEventHandler] DB Error fetching welcome_msg:', dbErr.message);
        }
      }

      const text = msgTemplate
        .replace(/{name}/g, uidList)
        .replace(/{group}/g, safeGroupId || 'the group');

      return { text };
    } catch (err) {
      console.error('❌ [GroupEventHandler] Error handling member join:', err.message);
      return { text: '👋 Welcome to the group!' };
    }
  }

  /**
   * Handles member leave/remove events and generates departure messages.
   * @param {Object} data 
   * @returns {Promise<Object>} { text: string }
   */
  async handleMemberLeave(data = {}) {
    try {
      const groupId = data?.groupId ?? data?.threadId ?? null;
      const leftUid = data?.leftUid ?? data?.targetUid ?? null;

      const safeGroupId = groupId ? String(groupId).trim() : null;
      const safeLeftUid = leftUid ? String(leftUid).trim() : 'A member';

      let msgTemplate = '👋 Goodbye {name} from {group}!';

      if (safeGroupId) {
        try {
          const res = await db.query('SELECT leave_msg FROM groups WHERE thread_id = $1;', [safeGroupId]);
          if (res?.rows?.[0]?.leave_msg) {
            msgTemplate = String(res.rows[0].leave_msg);
          }
        } catch (dbErr) {
          console.error('❌ [GroupEventHandler] DB Error fetching leave_msg:', dbErr.message);
        }
      }

      const text = msgTemplate
        .replace(/{name}/g, safeLeftUid)
        .replace(/{group}/g, safeGroupId || 'the group');

      return { text };
    } catch (err) {
      console.error('❌ [GroupEventHandler] Error handling member leave:', err.message);
      return { text: '👋 A member has left the group.' };
    }
  }
}

export default GroupEventHandler;
