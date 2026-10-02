import db from './connection.js';

export async function initAdvancedSchema() {
  await db.query(`
    -- Add custom notice columns to groups table
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
  `);
  console.log('✅ Advanced Database Schema Updated!');
}

export default initAdvancedSchema;
