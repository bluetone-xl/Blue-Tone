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
    const commandsPath = path.resolve(process.cwd(), 'app', 'commands');
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const commandModule = await import(fileUrl);
        const command = commandModule.default;

        if (command && command.name) {
          this.commands.set(command.name.toLowerCase(), command);

          if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
              this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
            });
          }
        }
      } catch (err) {
        Logger.error('CMD_LOAD_ERR', `Failed to load command ${file}: ${err.message}`);
      }
    }

    Logger.info('CMD_LOADER', `Loaded ${this.commands.size} commands successfully.`);
  }

  getCommand(name) {
    const cmdName = name.toLowerCase();
    if (this.commands.has(cmdName)) {
      return this.commands.get(cmdName);
    }
    if (this.aliases.has(cmdName)) {
      return this.commands.get(this.aliases.get(cmdName));
    }
    return null;
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

export default new CommandLoader();
