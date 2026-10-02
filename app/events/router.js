import db from '../database/connection.js';
import { isBotOwner } from '../core/auth.js';

export class EventRouter {
  constructor() {
    this.runtime = null;
  }

  setRuntime(runtime) {
    this.runtime = runtime;
  }

  async processIncomingMessage(data) {
    const { senderId, groupId, body, quotedMessage, fbApi } = data;

    if (!body || !this.runtime) return { status: 'NO_OP' };

    let prefix = '!';
    if (groupId) {
      try {
        const gRes = await db.query("SELECT prefix FROM groups WHERE group_id = $1;", [groupId]);
        if (gRes.rows[0]?.prefix) prefix = gRes.rows[0].prefix;
      } catch (err) {
        prefix = '!';
      }
    }

    if (!body.startsWith(prefix)) return { status: 'NOT_A_COMMAND' };

    let rawArgs = body.slice(prefix.length).trim().split(/\s+/);
    const commandName = rawArgs.shift().toLowerCase();

    // Check Remote Routing Flags (--thread <id>, --uid <uid>)
    let targetGroupId = null;
    let targetUid = null;

    const threadIndex = rawArgs.indexOf('--thread');
    if (threadIndex !== -1 && rawArgs[threadIndex + 1]) {
      targetGroupId = rawArgs[threadIndex + 1];
      rawArgs.splice(threadIndex, 2);
    }

    const uidIndex = rawArgs.indexOf('--uid');
    if (uidIndex !== -1 && rawArgs[uidIndex + 1]) {
      targetUid = rawArgs[uidIndex + 1];
      rawArgs.splice(uidIndex, 2);
    }

    const command = this.runtime.commands.get(commandName);
    if (!command) return { status: 'UNKNOWN_COMMAND' };

    if (!isBotOwner(senderId)) {
      const isAllowed = this.runtime.rateLimiter.check(senderId);
      if (!isAllowed) {
        const remaining = this.runtime.rateLimiter.getRemainingCooldown(senderId);
        return { text: `⏳ Slow down! Please wait ${remaining.toFixed(1)}s.` };
      }
    }

    const context = {
      senderId,
      groupId,
      targetGroupId,
      targetUid,
      args: rawArgs,
      prefix,
      quotedMessage,
      fbApi,
      isBotAdmin: true, // Mocked as true for testing; will read from live context
      isGroupAdmin: true,
      runtime: this.runtime
    };

    return await command.execute(context);
  }
}

export default EventRouter;
