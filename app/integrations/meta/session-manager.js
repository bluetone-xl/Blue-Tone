import fs from 'fs/promises';
import path from 'path';

export class SessionManager {
  constructor() {
    this.localPath = path.join(process.cwd(), 'appstate.json');
  }

  async loadAppState() {
    // 1. Try loading from local file
    try {
      const data = await fs.readFile(this.localPath, 'utf8');
      console.log('✅ Loaded appstate from local appstate.json file.');
      return JSON.parse(data);
    } catch (err) {
      console.log('ℹ️ Local appstate.json not found or invalid.');
    }

    return null;
  }

  async saveAppState(appState) {
    try {
      await fs.writeFile(this.localPath, JSON.stringify(appState, null, 2));
      console.log('💾 AppState updated and saved locally to appstate.json');
    } catch (err) {
      console.error('❌ Failed to save appstate locally:', err);
    }
  }
}

export default SessionManager;
