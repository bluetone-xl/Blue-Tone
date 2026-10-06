import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './connection.js';
import Logger from '../core/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database initialization and migration runner
 */
export class DatabaseInit {
  /**
   * Run all migrations from the migrations folder
   */
  async runMigrations() {
    if (!db.connected) {
      Logger.warn('DB_INIT', 'Database not connected. Skipping migrations.');
      return false;
    }

    try {
      const migrationsPath = path.resolve(process.cwd(), 'migrations');

      // Check if migrations directory exists
      try {
        await fs.access(migrationsPath);
      } catch {
        Logger.info('DB_INIT', 'Migrations directory not found');
        return false;
      }

      const files = await fs.readdir(migrationsPath);
      const sqlFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      if (sqlFiles.length === 0) {
        Logger.info('DB_INIT', 'No migration files found');
        return true;
      }

      for (const file of sqlFiles) {
        try {
          const filePath = path.join(migrationsPath, file);
          const sql = await fs.readFile(filePath, 'utf-8');

          Logger.info('DB_INIT', `Running migration: ${file}`);
          await db.query(sql);
          Logger.info('DB_INIT', `Completed migration: ${file}`);
        } catch (error) {
          Logger.error('DB_INIT', `Failed to run migration ${file}:`, error?.message);
        }
      }

      Logger.info('DB_INIT', 'All migrations completed');
      return true;
    } catch (error) {
      Logger.error('DB_INIT', 'Migration error:', error?.message);
      return false;
    }
  }

  /**
   * Verify required tables exist
   */
  async verifySchema() {
    if (!db.connected) {
      Logger.warn('DB_INIT', 'Database not connected. Cannot verify schema.');
      return false;
    }

    try {
      const requiredTables = ['users', 'groups', 'appstates', 'logs'];

      for (const table of requiredTables) {
        const result = await db.query(
          "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)",
          [table]
        );

        if (!result?.rows?.[0]?.exists) {
          Logger.warn('DB_INIT', `Required table missing: ${table}`);
          return false;
        }
      }

      Logger.info('DB_INIT', 'Schema verification passed');
      return true;
    } catch (error) {
      Logger.error('DB_INIT', 'Schema verification error:', error?.message);
      return false;
    }
  }
}

export default new DatabaseInit();
