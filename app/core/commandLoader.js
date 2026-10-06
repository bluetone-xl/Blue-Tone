import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import Logger from './logger.js';

class CommandLoader {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  async loadCommands() {
    this.commands.clear();
    this.aliases.clear();

    const commandsPath = path.resolve(process.cwd(), 'app', 'commands');

    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      Logger.warn('CMD_LOADER', 'Created app/commands directory.');
    }

    const commandFiles = fs.readdirSync(commandsPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
      .map((entry) => entry.name)
      .sort();

    if (commandFiles.length === 0) {
      Logger.warn('CMD_LOADER', 'No command files found in app/commands.');
      return;
    }

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const commandModule = await import(fileUrl);
        const command = commandModule.default;

        if (!command || !command.name) {
          Logger.warn('CMD_LOADER', `Skipped invalid command module: ${file}`);
          continue;
        }

        this.commands.set(String(command.name).toLowerCase(), command);

        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            this.aliases.set(String(alias).toLowerCase(), String(command.name).toLowerCase());
          }
        }
      } catch (err) {
        Logger.error('CMD_LOADER', `Failed to load command ${file}:`, err.message || err);
      }
    }

    Logger.info('CMD_LOADER', `Loaded ${this.commands.size} command(s).`);
  }

  getCommand(name) {
    if (!name || typeof name !== 'string') return null;

    const key = name.toLowerCase();

    if (this.commands.has(key)) {
      return this.commands.get(key);
    }

    if (this.aliases.has(key)) {
      const target = this.aliases.get(key);
      return this.commands.get(target);
    }

    return null;
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

export default new CommandLoader();