import dotenv from 'dotenv';
dotenv.config();

import login from 'fca-unofficial';
import fs from 'fs';
import path from 'path';
import commandLoader from './app/core/commandLoader.js';
import noPrefix from './app/events/noPrefix.js';
import Logger from './app/core/logger.js';

const appStatePath = path.resolve(process.cwd(), 'appstate.json');

if (!fs.existsSync(appStatePath)) {
  Logger.error('INIT', 'appstate.json file not found! Please place your session appstate.json in the root directory.');
  process.exit(1);
}

const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));

(async () => {
  await commandLoader.loadCommands();

  login({ appState }, (err, api) => {
    if (err) {
      Logger.error('LOGIN_ERR', 'Failed to authenticate with Facebook:', err.message || err);
      return;
    }

    api.setOptions({
      listenEvents: true,
      selfListen: false,
      logLevel: 'silent'
    });

    Logger.info('SYSTEM', 'BlueTone Bot is online and listening for events...');

    api.listenMqtt(async (error, event) => {
      if (error) {
        Logger.error('MQTT_ERR', 'Error in MQTT listener:', error.message || error);
        return;
      }

      try {
        const isNoPrefixHandled = await noPrefix.handle({ api, event });
        if (isNoPrefixHandled) return;
      } catch (err) {
        Logger.error('NO_PREFIX_ERR', 'Failed executing noPrefix handler:', err.message || err);
      }

      if (event.type === 'message' || event.type === 'message_reply') {
        const body = event.body ? event.body.trim() : '';
        const prefix = process.env.BOT_PREFIX || '!';

        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commandLoader.getCommand(commandName);
        if (!command) return;

        try {
          await command.execute({ api, event, args, commandLoader });
        } catch (cmdErr) {
          Logger.error('EXEC_ERR', `Error running command ${commandName}:`, cmdErr.message || cmdErr);
          api.sendMessage(`❌ Execution error: ${cmdErr.message || cmdErr}`, event.threadID, event.messageID);
        }
      }
    });
  });
})();
