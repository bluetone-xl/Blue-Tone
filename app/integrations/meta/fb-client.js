import fs from 'fs';
import login from 'fca-unofficial';

export default class FBClient {
  constructor(runtime) {
    this.runtime = runtime;
    this.api = null;
  }

  async start() {
    return new Promise((resolve, reject) => {
      let appStateData;
      
      try {
        appStateData = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
      } catch (err) {
        console.error('Error reading appstate.json:', err.message);
        return reject(err);
      }

      const loginOptions = {
        appState: appStateData,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        forceLogin: true
      };

      login(loginOptions, (err, api) => {
        if (err) {
          console.error('FB Login Failed:', err);
          return reject(err);
        }

        this.api = api;

        api.setOptions({
          listenEvents: true,
          selfListen: false,
          autoMarkDelivery: false,
          forceLogin: true,
          online: true
        });

        console.log('FB Client Logged In Successfully!');

        api.listenMqtt((err, event) => {
          if (err) {
            if (err.error === 1357004 || err.message?.includes('Not logged in')) {
              console.log("MQTT Bypass triggered (Error 1357004). Session retrying...");
            } else {
              console.error("MQTT Error:", err);
            }
            return;
          }

          if (this.runtime && this.runtime.handleEvent) {
            this.runtime.handleEvent(event, api);
          }
        });

        resolve(api);
      });
    });
  }
}
