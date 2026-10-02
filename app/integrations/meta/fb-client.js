import login from 'fca-unofficial';
import SessionManager from './session-manager.js';

export class FBClient {
  constructor(runtime) {
    this.runtime = runtime;
    this.sessionMgr = new SessionManager();
    this.api = null;
  }

  async start() {
    const appState = await this.sessionMgr.loadAppState();
    if (!appState) {
      console.error('❌ No appstate.json found! Please place appstate.json in root directory.');
      return;
    }

    const options = {
      appState,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    login(options, (err, api) => {
      if (err) {
        console.error('❌ Login Error:', err);
        return;
      }

      this.api = api;
      console.log('🚀 BlueTone Bot successfully logged into Facebook!');

      api.setOptions({
        listenEvents: true,
        selfListen: false,
        autoMarkDelivery: false,
        forceLogin: true
      });

      this.sessionMgr.saveAppState(api.getAppState());

      // Start listening to events
      api.listenMqtt(async (err, event) => {
        if (err) {
          // Quietly ignore temporary MQTT sequence check failures
          return;
        }

        if (event) {
          console.log('📩 Incoming Event Detected:', event.type);
        }

        const mappedEvent = this.mapFcaEvent(event);
        if (mappedEvent) {
          mappedEvent.data.fbApi = this.getApiWrapper();
          const response = await this.runtime.extensionEvents.handle(mappedEvent);
          if (response && response.text) {
            api.sendMessage(response.text, event.threadID);
          }
        }
      });
    });
  }

  mapFcaEvent(event) {
    if (!event) return null;
    if (event.type === 'message' || event.type === 'message_reply') {
      return {
        type: 'message',
        data: {
          senderId: event.senderID,
          groupId: event.isGroup ? event.threadID : null,
          body: event.body,
          quotedMessage: event.messageReply ? { imageUrl: event.messageReply.attachments?.[0]?.url } : null
        }
      };
    }
    return null;
  }

  getApiWrapper() {
    return {
      addUserToGroup: (uid, threadId) => this.api?.addUserToGroup(uid, threadId),
      changeGroupImage: (imagePath, threadId) => this.api?.changeGroupImage(imagePath, threadId),
      changeThreadColor: (color, threadId) => this.api?.changeThreadColor(color, threadId),
      changeNickname: (nickname, threadId, uid) => this.api?.changeNickname(nickname, threadId, uid)
    };
  }
}

export default FBClient;
