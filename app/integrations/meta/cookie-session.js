import fs from 'fs/promises';
import path from 'path';
import db from '../../database/connection.js';

export class CookieSessionManager {
  async getValidCookies() {
    try {
      const appstatePath = path.resolve(process.cwd(), 'appstate.json');
      const fileData = await fs.readFile(appstatePath, 'utf-8').catch(() => null);

      if (fileData) {
        const parsed = JSON.parse(fileData);
        return this.formatCookies(parsed);
      }

      const dbRes = await db.query("SELECT state_data FROM appstates WHERE key = 'fb_session' LIMIT 1;");
      if (dbRes.rows.length > 0) {
        return this.formatCookies(dbRes.rows[0].state_data);
      }

      return null;
    } catch (error) {
      console.error('❌ Cookie session parse error:', error.message);
      return null;
    }
  }

  formatCookies(cookieData) {
    if (Array.isArray(cookieData)) {
      return cookieData.map(c => `${c.key || c.name}=${c.value}`).join('; ');
    } else if (typeof cookieData === 'object') {
      return Object.entries(cookieData).map(([k, v]) => `${k}=${v}`).join('; ');
    }
    return String(cookieData);
  }
}

export default new CookieSessionManager();
