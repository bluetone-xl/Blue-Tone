import db from '../database/connection.js';

export class GroupEventHandler {
  async handleMemberJoin(data) {
    const { groupId, joinedUids } = data;
    const uidList = joinedUids ? joinedUids.join(', ') : 'New Member';

    let msgTemplate = '👋 Welcome {name} to {group}!';
    try {
      const res = await db.query('SELECT welcome_msg FROM groups WHERE group_id = $1;', [groupId]);
      if (res.rows[0]?.welcome_msg) msgTemplate = res.rows[0].welcome_msg;
    } catch (e) {}

    const text = msgTemplate
      .replace(/{name}/g, uidList)
      .replace(/{group}/g, groupId || 'the group');

    return { text };
  }

  async handleMemberLeave(data) {
    const { groupId, leftUid } = data;

    let msgTemplate = '👋 Goodbye {name} from {group}!';
    try {
      const res = await db.query('SELECT leave_msg FROM groups WHERE group_id = $1;', [groupId]);
      if (res.rows[0]?.leave_msg) msgTemplate = res.rows[0].leave_msg;
    } catch (e) {}

    const text = msgTemplate
      .replace(/{name}/g, leftUid)
      .replace(/{group}/g, groupId || 'the group');

    return { text };
  }
}

export default GroupEventHandler;
