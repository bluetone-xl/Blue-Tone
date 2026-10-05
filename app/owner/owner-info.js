import { Logger } from '../core/logger.js';

/**
 * Service to hold and manage bot owner information and metadata.
 */
export class OwnerInfo {
  constructor() {
    this.info = {
      id: process.env.OWNER_ID || '',
      name: process.env.OWNER_NAME || 'Rafeez',
      facebook: process.env.OWNER_FB || '',
      updatedAt: new Date()
    };
  }

  /**
   * Updates owner metadata in memory.
   */
  setOwnerInfo(newInfo = {}) {
    this.info = {
      ...this.info,
      ...newInfo,
      updatedAt: new Date()
    };
    Logger.info('OWNER_INFO', 'Owner information updated successfully');
    return this.info;
  }

  /**
   * Retrieves complete owner info object.
   */
  getOwnerInfo() {
    return { ...this.info };
  }

  /**
   * Retrieves primary owner Facebook ID or User ID.
   */
  getOwnerId() {
    return String(this.info.id || '').trim();
  }

  /**
   * Checks if a given userId matches the owner ID.
   */
  isOwner(userId) {
    if (!userId) return false;
    const cleanUserId = String(userId).trim();
    const cleanOwnerId = String(this.info.id).trim();

    return cleanOwnerId.length > 0 && cleanUserId === cleanOwnerId;
  }
}

export const ownerInfoStore = new OwnerInfo();
export default ownerInfoStore;
