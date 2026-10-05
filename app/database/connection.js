import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ [DB Connection] DATABASE_URL is not defined in environment variables!');
}

// Termux local connection pool setup optimized for low resource footprint
const pool = new Pool({
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ [DB Connection] Unexpected idle database pool error:', err.message);
});

/**
 * Database interface wrapper with fail-safe handling.
 */
export const db = {
  /**
   * Executes a database query safely with parameter binding.
   * @param {string} text 
   * @param {Array} [params=[]] 
   * @returns {Promise<Object>}
   */
  async query(text, params = []) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid query string provided.');
      }
      const safeParams = Array.isArray(params) ? params : [];
      return await pool.query(text, safeParams);
    } catch (err) {
      console.error('❌ [DB Query Error]:', err.message);
      // Return empty rows shape to prevent downstream property access crash
      return { rows: [], rowCount: 0, error: err.message };
    }
  },

  /**
   * Acquires a direct client from the connection pool.
   * @returns {Promise<Object|null>}
   */
  async getClient() {
    try {
      return await pool.connect();
    } catch (err) {
      console.error('❌ [DB Client Error] Failed to acquire client from pool:', err.message);
      return null;
    }
  },

  /**
   * Gracefully shuts down the connection pool.
   */
  async close() {
    try {
      await pool.end();
      console.log('🔌 [DB Connection] Database pool closed successfully.');
    } catch (err) {
      console.error('❌ [DB Close Error] Error closing pool:', err.message);
    }
  }
};

// Graceful shutdown on application exit signals
process.on('SIGINT', async () => {
  await db.close();
});

process.on('SIGTERM', async () => {
  await db.close();
});

export default db;
