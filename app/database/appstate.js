import db from './connection.js';

export const AppStateQuery = {
  async save(key, data) {
    const query = `
      INSERT INTO appstates (key, state_data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key)
      DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = NOW()
      RETURNING *;
    `;
    const res = await db.query(query, [key, JSON.stringify(data)]);
    return res.rows[0];
  },

  async get(key) {
    const res = await db.query('SELECT state_data FROM appstates WHERE key = $1', [key]);
    if (res.rows.length === 0) return null;
    return res.rows[0].state_data;
  }
};

export default AppStateQuery;
