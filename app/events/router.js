import db from '../database/connection.js';
import { isOwner } from '../core/permission.js';

/**
 * EventRouter coordinates message context parsing, remote flags, rate limiting, and command execution.
 */
export class EventRouter {
  constructor() {
    this.runtime = null;
  }

  /**
   * Binds the runtime instance to the router.
   * @param {Object} runtime 
   */
  setRuntime(runtime) {
    try {
      if (runtime && typeof runtime === 'object') {
        this.runtime = runtime;
      }
    } catch (err) {
      console.error('❌ [EventRouter] Error setting runtime:', err.message);
    }
  }

  /**
   * Processes incoming Facebook message events safely.
   * @param {Object} [data={}] 
   * @returns {Promise<Object>}
   */
  async processIncomingMessage(data = {}) {
    try {
      if (!data || typeof data !== 'object') {
        return { status: 'INVALID_DATA' };
      }

      const senderId = data.senderId ?? data.senderUid ?? data.authorId ?? null;
      const groupId = data.groupId ?? data.threadId ?? null;
      const body = typeof data.body === 'string' ? data.body.trim() : String(data.body || '').trim();
      const quotedMessage = data.quotedMessage || null;
      const fbApi = data.fbApi || null;

      if (!body || !this.runtime) {
        return { status: 'NO_OP' };
      }

      const safeSenderId = senderId ? String(senderId).trim() : null;
      const safeGroupId = groupId ? String(groupId).trim() : null;

      // Fetch custom prefix from DB or default to '!'
      let prefix = '!';
      if (safeGroupId) {
        try {
          const gRes = await db.query('SELECT prefix FROM groups WHERE thread_id = $1;', [safeGroupId]);
          if (gRes?.rows?.[0]?.prefix) {
            prefix = String(gRes.rows[0].prefix).trim() || '!';
          }
        } catch (dbErr) {
          console.error('❌ [EventRouter] DB Error fetching prefix:', dbErr.message);
          prefix = '!';
        }
      }

      if (!body.startsWith(prefix)) {
        return { status: 'NOT_A_COMMAND' };
      }

      // Parse command and arguments
      const cleanContent = body.slice(prefix.length).trim();
      let rawArgs = cleanContent.split(/\s+/).filter(Boolean);
      
      if (rawArgs.length === 0) {
        return { status: 'EMPTY_COMMAND' };
      }

      const commandName = rawArgs.shift().toLowerCase();

      // Remote Routing Flags (--thread <id>, --uid <uid>)
      let targetGroupId = null;
      let targetUid = null;

      const threadIndex = rawArgs.indexOf('--thread');
      if (threadIndex !== -1 && rawArgs[threadIndex + 1]) {
        targetGroupId = String(rawArgs[threadIndex + 1]).trim();
        rawArgs.splice(threadIndex, 2);
      }

      const uidIndex = rawArgs.indexOf('--uid');
      if (uidIndex !== -1 && rawArgs[uidIndex + 1]) {
        targetUid = String(rawArgs[uidIndex + 1]).trim();
        rawArgs.splice(uidIndex, 2);
      }

      // Command Lookup
      const command = this.runtime.commands?.get(commandName);
      if (!command || typeof command.execute !== 'function') {
        return { status: 'UNKNOWN_COMMAND' };
      }

      // Rate Limiting Check (Bypass for Bot Owner)
      if (safeSenderId && !isOwner(safeSenderId)) {
        if (this.runtime.rateLimiter && typeof this.runtime.rateLimiter.isRateLimited === 'function') {
          const rateCheck = this.runtime.rateLimiter.isRateLimited(safeSenderId);
          if (rateCheck?.limited) {
            return { text: `⏳ Slow down! Please wait ${rateCheck.remaining || 'a few'}s.` };
          }
        }
      }

      // Build Execution Context
      const context = {
        senderId: safeSenderId,
        groupId: safeGroupId,
        targetGroupId,
        targetUid,
        args: rawArgs,
        prefix,
        quotedMessage,
        fbApi,
        isBotAdmin: isOwner(safeSenderId),
        isGroupAdmin: true,
        runtime: this.runtime
      };

      return await command.execute(context);
    } catch (err) {
      console.error('❌ [EventRouter] Fatal error processing message:', err.message);
      return { status: 'ERROR', error: err.message };
    }
  }
}

export default EventRouter;
