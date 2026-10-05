import db from './connection.js';

/**
 * User Query Helpers
 */
export const UserQuery = {
  /**
   * Upserts a user record into the database.
   * @param {string|number} uid 
   * @param {string} [name=''] 
   * @param {string} [role='user'] 
   * @returns {Promise<Object|null>}
   */
  async upsert(uid, name = '', role = 'user') {
    try {
      if (!uid) return null;

      const safeUid = String(uid).trim();
      const safeName = String(name || '').trim();
      const safeRole = String(role || 'user').trim();

      const query = `
        INSERT INTO users (uid, name, role, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (uid) 
        DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, updated_at = NOW()
        RETURNING *;
      `;

      const res = await db.query(query, [safeUid, safeName, safeRole]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [UserQuery] Error in upsert:', err.message);
      return null;
    }
  },

  /**
   * Retrieves a user by UID.
   * @param {string|number} uid 
   * @returns {Promise<Object|null>}
   */
  async getByUid(uid) {
    try {
      if (!uid) return null;

      const safeUid = String(uid).trim();
      const res = await db.query('SELECT * FROM users WHERE uid = $1', [safeUid]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [UserQuery] Error in getByUid:', err.message);
      return null;
    }
  }
};

/**
 * Group Query Helpers
 */
export const GroupQuery = {
  /**
   * Upserts group metadata into the database.
   * @param {string|number} threadId 
   * @param {string} [name=''] 
   * @param {string} [prefix='!'] 
   * @returns {Promise<Object|null>}
   */
  async upsert(threadId, name = '', prefix = '!') {
    try {
      if (!threadId) return null;

      const safeThreadId = String(threadId).trim();
      const safeName = String(name || '').trim();
      const safePrefix = String(prefix || '!').trim();

      const query = `
        INSERT INTO groups (thread_id, name, prefix, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (thread_id)
        DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
        RETURNING *;
      `;

      const res = await db.query(query, [safeThreadId, safeName, safePrefix]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [GroupQuery] Error in upsert:', err.message);
      return null;
    }
  },

  /**
   * Updates group command prefix.
   * @param {string|number} threadId 
   * @param {string} prefix 
   * @returns {Promise<Object|null>}
   */
  async setPrefix(threadId, prefix) {
    try {
      if (!threadId || !prefix) return null;

      const safeThreadId = String(threadId).trim();
      const safePrefix = String(prefix).trim();

      const query = `
        INSERT INTO groups (thread_id, prefix, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (thread_id)
        DO UPDATE SET prefix = EXCLUDED.prefix, updated_at = NOW()
        RETURNING *;
      `;

      const res = await db.query(query, [safeThreadId, safePrefix]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [GroupQuery] Error in setPrefix:', err.message);
      return null;
    }
  },

  /**
   * Retrieves group metadata by thread ID.
   * @param {string|number} threadId 
   * @returns {Promise<Object|null>}
   */
  async getById(threadId) {
    try {
      if (!threadId) return null;

      const safeThreadId = String(threadId).trim();
      const res = await db.query('SELECT * FROM groups WHERE thread_id = $1', [safeThreadId]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [GroupQuery] Error in getById:', err.message);
      return null;
    }
  }
};

/**
 * Log Query Helpers
 */
export const LogQuery = {
  /**
   * Inserts an execution log entry into the database.
   * @param {string|number|null} userUid 
   * @param {string|number|null} threadId 
   * @param {string} command 
   * @param {string} status 
   * @returns {Promise<Object|null>}
   */
  async add(userUid, threadId, command, status) {
    try {
      const safeUserUid = userUid ? String(userUid).trim() : null;
      const safeThreadId = threadId ? String(threadId).trim() : null;
      const safeCommand = command ? String(command).trim() : 'UNKNOWN';
      const safeStatus = status ? String(status).trim() : 'SUCCESS';

      const query = `
        INSERT INTO logs (user_uid, thread_id, command, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const res = await db.query(query, [safeUserUid, safeThreadId, safeCommand, safeStatus]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [LogQuery] Error adding log entry:', err.message);
      return null;
    }
  }
};

export default { UserQuery, GroupQuery, LogQuery };
