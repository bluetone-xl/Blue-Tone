const fs = require('fs');
const login = require('fca-unofficial');

const loginOptions = {
  appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')),
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  forceLogin: true
};

login(loginOptions, (err, api) => {
  if (err) return console.error("Login error:", err);

  api.setOptions({
    listenEvents: true,
    selfListen: false,
    autoMarkDelivery: false,
    forceLogin: true,
    online: true
  });

  api.listenMqtt((err, event) => {
    if (err) {
      if (err.error === 1357004 || err.message?.includes('Not logged in')) {
        console.log("MQTT Bypass triggered. Retrying session...");
      }
      return console.error("MQTT Listen Error:", err);
    }
    
    // আপনার বোটের মেসেজ প্রসেসিং লজিক এখানে
    console.log("Event received:", event);
  });
});
import { createRuntime } from './app/core/bootstrap.js';
import FBClient from './app/integrations/meta/fb-client.js';

async function main() {
  console.log('🤖 Starting BlueTone Bot Initialization...');

  try {
    // 1. Core Runtime Init
    const runtime = createRuntime();
    console.log('✅ Core Runtime & Event Router Loaded.');

    // 2. FB Client Init & AppState Login
    const client = new FBClient(runtime);
    await client.start();

  } catch (error) {
    console.error('💥 Critical Startup Error:', error);
    process.exit(1);
  }
}

main();
