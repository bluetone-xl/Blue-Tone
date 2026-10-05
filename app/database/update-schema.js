import db from './connection.js';

/**
 * Initializes and updates the advanced database schema safely within a transaction.
 * @returns {Promise<boolean>}
 */
export async function initAdvancedSchema() {
  try {
    console.log('🔄 [DB Schema] Starting advanced database schema update...');

    // Execute schema migration in an atomic transaction
    await db.query('BEGIN;');

    const migrationQuery = `
      -- Add custom notice columns to groups table safely
      ALTER TABLE groups 
      ADD COLUMN IF NOT EXISTS welcome_msg TEXT DEFAULT '👋 Welcome {name} to {group}!',
      ADD COLUMN IF NOT EXISTS leave_msg TEXT DEFAULT '👋 Goodbye {name} from {group}!',
      ADD COLUMN IF NOT EXISTS remove_msg TEXT DEFAULT '⚠️ {name} was removed from {group}!';

      -- Global settings table for bot management
      CREATE TABLE IF NOT EXISTS global_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await db.query(migrationQuery);
    await db.query('COMMIT;');

    console.log('✅ [DB Schema] Advanced Database Schema updated successfully!');
    return true;
  } catch (err) {
    // Rollback transaction in case of failure
    try {
      await db.query('ROLLBACK;');
    } catch (rollbackErr) {
      console.error('❌ [DB Schema] Rollback error:', rollbackErr.message);
    }

    console.error('❌ [DB Schema] Failed to update schema:', err.message);
    return false;
  }
}

export default initAdvancedSchema;
