import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import login from 'fca-unofficial';
import Logger from './app/core/logger.js';
import commandLoader from './app/core/commandLoader.js';
import noPrefix from './app/events/noPrefix.js';

const appStatePath = path.resolve(process.cwd(), 'appstate.json');

function loadAppState() {
  if (!fs.existsSync(appStatePath)) {
    Logger.error('INIT', 'appstate.json not found. Put your Facebook session appstate in the project root.');
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
  } catch (error) {
    Logger.error('INIT', 'appstate.json is invalid JSON:', error.message || error);
    process.exit(1);
  }
}

async function startBot() {
  try {
    Logger.info('INIT', 'Loading commands...');
    await commandLoader.loadCommands();

    const appState = loadAppState();

    Logger.info('INIT', 'Authenticating with Facebook...');
    login({ appState }, (err, api) => {
      if (err) {
        Logger.error('LOGIN_ERR', 'Facebook login failed:', err.message || err);
        process.exit(1);
      }

      api.setOptions({
        listenEvents: true,
        selfListen: false,
        logLevel: 'silent',
        autoMarkDelivery: false
      });

      Logger.info('SYSTEM', 'BlueTone Bot is online and listening for events...');

      api.listenMqtt(async (error, event) => {
        if (error) {
          Logger.error('MQTT_ERR', 'MQTT listener error:', error.message || error);
          return;
        }

        if (!event) return;

        try {
          const handled = await noPrefix.handle({ api, event });
          if (handled) return;
        } catch (noPrefixErr) {
          Logger.error('NO_PREFIX_EXEC_ERR', 'noPrefix handler failed:', noPrefixErr.message || noPrefixErr);
        }

        if (event.type !== 'message' && event.type !== 'message_reply') return;

        const body = typeof event.body === 'string' ? event.body.trim() : '';
        const prefix = process.env.DEFAULT_PREFIX || process.env.PREFIX || process.env.BOT_PREFIX || '!';

        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = commandLoader.getCommand(commandName);
        if (!command) return;

        try {
          await command.execute({ api, event, args, commandLoader });
        } catch (cmdErr) {
          Logger.error('EXEC_ERR', `Command execution failed for ${commandName}:`, cmdErr.message || cmdErr);
          api.sendMessage(`❌ Execution error: ${cmdErr.message || cmdErr}`, event.threadID, event.messageID);
        }
      });
    });
  } catch (error) {
    Logger.error('INIT', 'Fatal startup error:', error.message || error);
    process.exit(1);
  }
}

startBot();