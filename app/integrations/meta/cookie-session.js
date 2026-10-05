import fs from 'fs/promises';
import path from 'path';
import db from '../../database/connection.js';
import { Logger } from '../../core/logger.js';

/**
 * Manages fetching and formatting cookie session strings from local appstate or PostgreSQL.
 */
export class CookieSessionManager {
  /**
   * Retrieves and formats valid cookies/appstate from file or database.
   */
  async getValidCookies() {
    try {
      // 1. Try reading local appstate.json first
      const appstatePath = path.resolve(process.cwd(), 'appstate.json');
      const fileData = await fs.readFile(appstatePath, 'utf-8').catch(() => null);

      if (fileData) {
        try {
          const parsed = JSON.parse(fileData);
          const formatted = this.formatCookies(parsed);
          if (formatted) return formatted;
        } catch (jsonErr) {
          Logger.warn('COOKIE_SESSION', 'Failed to parse local appstate.json, falling back to database');
        }
      }

      // 2. Fallback to PostgreSQL appstates table
      if (db && typeof db.query === 'function') {
        const dbRes = await db.query(
          "SELECT state_data FROM appstates WHERE key = 'fb_session' LIMIT 1;"
        );

        if (dbRes?.rows?.length > 0) {
          return this.formatCookies(dbRes.rows[0].state_data);
        }
      }

      Logger.warn('COOKIE_SESSION', 'No valid cookie session found in file or database');
      return null;
    } catch (error) {
      Logger.error('COOKIE_SESSION', 'Cookie session parse error:', error?.message || error);
      return null;
    }
  }

  /**
   * Formats array, object, or raw string cookie data into a standard header string.
   */
  formatCookies(cookieData) {
    if (!cookieData) return '';

    if (Array.isArray(cookieData)) {
      return cookieData
        .filter((c) => c && (c.key || c.name) && c.value !== undefined)
        .map((c) => `${String(c.key || c.name).trim()}=${String(c.value).trim()}`)
        .join('; ');
    }

    if (typeof cookieData === 'object') {
      return Object.entries(cookieData)
        .map(([k, v]) => `${String(k).trim()}=${String(v).trim()}`)
        .join('; ');
    }

    return String(cookieData).trim();
  }
}

export const cookieSessionManager = new CookieSessionManager();
export default cookieSessionManager;
