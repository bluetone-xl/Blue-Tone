import login from 'fca-unofficial';
import cookieSessionManager from './cookie-session.js';
import { Logger } from '../../core/logger.js';

/**
 * Client service to manage Facebook/FCA authentication, session initialization, and MQTT listener.
 */
export default class FBClient {
  constructor(runtime = null) {
    this.runtime = runtime;
    this.api = null;
    this.isListening = false;
  }

  /**
   * Initializes session and logs in to Facebook using FCA.
   */
  async start() {
    return new Promise(async (resolve, reject) => {
      try {
        const rawCookies = await cookieSessionManager.getValidCookies();
        
        if (!rawCookies) {
          const err = new Error('No valid cookie session or appstate found.');
          Logger.error('FB_CLIENT', err.message);
          return reject(err);
        }

        // Parse cookies into array format expected by fca-unofficial
        let appState;
        try {
          appState = typeof rawCookies === 'string' && rawCookies.startsWith('[')
            ? JSON.parse(rawCookies)
            : rawCookies;
        } catch {
          appState = rawCookies;
        }

        const loginOptions = {
          appState,
          userAgent: process.env.FB_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          forceLogin: true
        };

        login(loginOptions, (err, api) => {
          if (err) {
            Logger.error('FB_CLIENT', 'Facebook Login Failed:', err?.message || err);
            return reject(err);
          }

          this.api = api;

          // Standard FCA Options
          api.setOptions({
            listenEvents: true,
            selfListen: false,
            autoMarkDelivery: false,
            forceLogin: true,
            online: true,
            prefix: process.env.DEFAULT_PREFIX || '!'
          });

          Logger.info('FB_CLIENT', 'FB Client logged in successfully!');

          this._startListener();
          resolve(api);
        });
      } catch (error) {
        Logger.error('FB_CLIENT', 'Initialization error:', error?.message || error);
        reject(error);
      }
    });
  }

  /**
   * Starts the MQTT event listener stream.
   */
  _startListener() {
    if (!this.api || this.isListening) return;

    this.isListening = true;
    Logger.info('FB_CLIENT', 'Starting MQTT Event Listener...');

    this.api.listenMqtt((err, event) => {
      if (err) {
        if (err.error === 1357004 || String(err.message || '').includes('Not logged in')) {
          Logger.warn('FB_CLIENT', 'MQTT Session bypass triggered (Error 1357004). Retrying stream...');
        } else {
          Logger.error('FB_CLIENT', 'MQTT Event Error:', err?.message || err);
        }
        return;
      }

      if (!event) return;

      // Dispatch to global runtime event handler
      if (this.runtime && typeof this.runtime.handleEvent === 'function') {
        this.runtime.handleEvent(event, this.api);
      }
    });
  }

  /**
   * Safely stops the client session.
   */
  stop() {
    if (this.api && typeof this.api.logout === 'function') {
      this.api.logout();
    }
    this.api = null;
    this.isListening = false;
    Logger.info('FB_CLIENT', 'FB Client disconnected.');
  }
}
