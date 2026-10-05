import fs from 'fs/promises';
import path from 'path';
import { Logger } from './logger.js';

/**
 * Lightweight JSON File-based Database Service for persistence.
 */
export class Database {
  constructor(dbName = 'storage.json') {
    this.dbPath = path.join(process.cwd(), 'data', dbName);
    this.data = {};
    this.isInitialized = false;
  }

  /**
   * Initializes database storage directory and loads JSON file.
   */
  async init() {
    try {
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      try {
        const raw = await fs.readFile(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
        Logger.info('DATABASE', `Loaded existing database from ${this.dbPath}`);
      } catch (readErr) {
        if (readErr.code === 'ENOENT') {
          this.data = {};
          await this.save();
          Logger.info('DATABASE', `Created new database file at ${this.dbPath}`);
        } else {
          Logger.error('DATABASE', 'Failed to parse database file:', readErr?.message || readErr);
          this.data = {};
        }
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      Logger.error('DATABASE', 'Database initialization error:', err?.message || err);
      return false;
    }
  }

  /**
   * Saves current in-memory state to disk.
   */
  async save() {
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.dbPath, serialized, 'utf8');
      return true;
    } catch (err) {
      Logger.error('DATABASE', 'Failed to save database file:', err?.message || err);
      return false;
    }
  }

  /**
   * Retrieves a key from the database with optional default.
   */
  get(key, defaultValue = null) {
    if (!key) return defaultValue;
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  /**
   * Stores a key-value pair in memory and persists to disk.
   */
  async set(key, value) {
    if (!key) return false;
    this.data[key] = value;
    return await this.save();
  }

  /**
   * Deletes a key from the database.
   */
  async delete(key) {
    if (!key || !(key in this.data)) return false;
    delete this.data[key];
    return await this.save();
  }
}

export const db = new Database();
export default db;
