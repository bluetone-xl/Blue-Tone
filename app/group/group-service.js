import db from '../database/connection.js';
import { GroupAdminStore } from './admins.js';
import { AdminInfoStore } from './admin-info.js';
import { Logger } from '../core/logger.js';

/**
 * Service to manage group configurations, settings, and administration states.
 */
export class GroupService {
  constructor() {
    this.groups = new Map();
    this.admins = new GroupAdminStore();
    this.adminInfo = new AdminInfoStore();
    this.warnings = new Map();
  }

  /**
   * Loads group data from cache or PostgreSQL database.
   */
  async getGroup(groupId) {
    if (!groupId) return null;
    const id = String(groupId).trim();

    // Check cache first
    if (this.groups.has(id)) {
      return this.groups.get(id);
    }

    try {
      const result = await db.query(
        'SELECT * FROM groups WHERE group_id = $1 LIMIT 1',
        [id]
      );

      if (result.rows.length > 0) {
        const groupData = result.rows[0];
        this.groups.set(id, groupData);
        return groupData;
      }
    } catch (err) {
      Logger.error('GROUP_SERVICE', `Failed to fetch group ${id}:`, err?.message || err);
    }

    return null;
  }

  /**
   * Returns group settings or default configuration if not configured in DB.
   */
  async getSettings(groupId) {
    const group = await this.getGroup(groupId);
    
    return {
      prefix: group?.prefix || process.env.DEFAULT_PREFIX || '!',
      isBanned: group?.is_banned || false,
      adminOnly: group?.admin_only || false,
      customSettings: group?.settings || {}
    };
  }

  /**
   * Tracks warnings given to a user within a specific group.
   */
  addWarning(groupId, userId) {
    if (!groupId || !userId) return 0;
    
    const key = `${String(groupId).trim()}:${String(userId).trim()}`;
    const currentCount = (this.warnings.get(key) || 0) + 1;
    this.warnings.set(key, currentCount);

    return currentCount;
  }

  /**
   * Clears warnings for a user in a specific group.
   */
  clearWarnings(groupId, userId) {
    if (!groupId || !userId) return false;
    const key = `${String(groupId).trim()}:${String(userId).trim()}`;
    return this.warnings.delete(key);
  }
}

export default GroupService;
