import db from './connection.js';

/**
 * AppStateQuery manages Facebook appstate persistence in the database.
 */
export const AppStateQuery = {
  /**
   * Saves or updates an appstate entry by key.
   * @param {string} key 
   * @param {Object|Array|string} data 
   * @returns {Promise<Object|null>}
   */
  async save(key, data) {
    try {
      if (!key) {
        console.warn('⚠️ [AppStateQuery] Cannot save appstate: Key is missing.');
        return null;
      }

      const safeKey = String(key).trim();
      const serializedData = typeof data === 'string' ? data : JSON.stringify(data ?? {});

      const query = `
        INSERT INTO appstates (key, state_data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key)
        DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = NOW()
        RETURNING *;
      `;

      const res = await db.query(query, [safeKey, serializedData]);
      return res?.rows?.[0] || null;
    } catch (err) {
      console.error('❌ [AppStateQuery] Error saving appstate:', err.message);
      return null;
    }
  },

  /**
   * Fetches appstate data by key.
   * @param {string} key 
   * @returns {Promise<Object|Array|string|null>}
   */
  async get(key) {
    try {
      if (!key) return null;

      const safeKey = String(key).trim();
      const res = await db.query('SELECT state_data FROM appstates WHERE key = $1', [safeKey]);

      if (!res || !res.rows || res.rows.length === 0) {
        return null;
      }

      const rawData = res.rows[0].state_data;

      // Handle JSON parsing safely if data was stored as string
      if (typeof rawData === 'string') {
        try {
          return JSON.parse(rawData);
        } catch {
          return rawData;
        }
      }

      return rawData;
    } catch (err) {
      console.error('❌ [AppStateQuery] Error fetching appstate:', err.message);
      return null;
    }
  }
};

export default AppStateQuery;
