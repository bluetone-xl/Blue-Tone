import db from '../../database/connection.js';
import cookieSession from './cookie-session.js';

export class FacebookAccountManager {
  async executeSessionTask(taskType, payload) {
    const cookies = await cookieSession.getValidCookies();

    const taskData = {
      type: taskType,
      payload,
      cookiesPresent: !!cookies,
      status: 'READY_FOR_DISPATCH',
      createdAt: new Date().toISOString()
    };

    await db.query(
      `INSERT INTO appstates (key, state_data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = NOW();`,
      [`pending_${taskType.toLowerCase()}`, taskData]
    );

    return taskData;
  }

  async updateBio(bioText) {
    await this.executeSessionTask('CHANGE_BIO', { bio: bioText });
    return { success: true, action: 'UPDATE_BIO', bio: bioText };
  }

  async updateProfilePicture(imageUrl, caption = '') {
    await this.executeSessionTask('CHANGE_PFP', { imageUrl, caption: caption || null });
    return { success: true, action: 'UPDATE_PFP', imageUrl, caption };
  }

  async updateCoverPhoto(imageUrl) {
    await this.executeSessionTask('CHANGE_COVER', { imageUrl });
    return { success: true, action: 'UPDATE_COVER', imageUrl };
  }

  async createTextPost(text) {
    await this.executeSessionTask('POST_TEXT', { text });
    return { success: true, action: 'CREATE_TEXT_POST', content: text };
  }

  async createImagePost(imageUrl, caption = '') {
    await this.executeSessionTask('POST_IMAGE', { imageUrl, caption: caption || null });
    return { success: true, action: 'CREATE_IMAGE_POST', imageUrl, caption };
  }
}

export default new FacebookAccountManager();
