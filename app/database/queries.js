import db from './connection.js';

// User Helpers
export const UserQuery = {
  async upsert(uid, name = '', role = 'user') {
    const query = `
      INSERT INTO users (uid, name, role, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (uid) 
      DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, updated_at = NOW()
      RETURNING *;
    `;
    const res = await db.query(query, [uid, name, role]);
    return res.rows[0];
  },

  async getByUid(uid) {
    const res = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
    return res.rows[0] || null;
  }
};

// Group Helpers
export const GroupQuery = {
  async upsert(threadId, name = '', prefix = '!') {
    const query = `
      INSERT INTO groups (thread_id, name, prefix, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (thread_id)
      DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      RETURNING *;
    `;
    const res = await db.query(query, [threadId, name, prefix]);
    return res.rows[0];
  },

  async setPrefix(threadId, prefix) {
    const query = `
      INSERT INTO groups (thread_id, prefix, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (thread_id)
      DO UPDATE SET prefix = EXCLUDED.prefix, updated_at = NOW()
      RETURNING *;
    `;
    const res = await db.query(query, [threadId, prefix]);
    return res.rows[0];
  },

  async getById(threadId) {
    const res = await db.query('SELECT * FROM groups WHERE thread_id = $1', [threadId]);
    return res.rows[0] || null;
  }
};

// Log Helpers
export const LogQuery = {
  async add(userUid, threadId, command, status) {
    const query = `
      INSERT INTO logs (user_uid, thread_id, command, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await db.query(query, [userUid || null, threadId || null, command || 'UNKNOWN', status || 'SUCCESS']);
    return res.rows[0];
  }
};

export default { UserQuery, GroupQuery, LogQuery };
