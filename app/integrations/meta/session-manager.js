import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../../core/logger.js';

/**
 * Service to handle loading and persisting Meta/FCA appstate files.
 */
export class SessionManager {
  constructor() {
    this.localPath = path.join(process.cwd(), 'appstate.json');
  }

  /**
   * Loads appstate data from local filesystem.
   */
  async loadAppState() {
    try {
      const data = await fs.readFile(this.localPath, 'utf8');
      if (!data) return null;

      const parsed = JSON.parse(data);
      Logger.info('SESSION_MANAGER', 'Successfully loaded appstate from local appstate.json');
      return parsed;
    } catch (err) {
      if (err.code === 'ENOENT') {
        Logger.warn('SESSION_MANAGER', 'Local appstate.json file not found');
      } else {
        Logger.error('SESSION_MANAGER', 'Failed to parse appstate.json:', err?.message || err);
      }
      return null;
    }
  }

  /**
   * Persists updated appstate data to local appstate.json.
   */
  async saveAppState(appState) {
    if (!appState) {
      Logger.warn('SESSION_MANAGER', 'Save skipped: No appState data provided');
      return false;
    }

    try {
      const serialized = typeof appState === 'string' 
        ? appState 
        : JSON.stringify(appState, null, 2);

      await fs.writeFile(this.localPath, serialized, 'utf8');
      Logger.info('SESSION_MANAGER', 'AppState updated and saved locally to appstate.json');
      return true;
    } catch (err) {
      Logger.error('SESSION_MANAGER', 'Failed to save appstate locally:', err?.message || err);
      return false;
    }
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
