import { CommandLoader, commandLoader } from './command-loader.js';
import pingCommand from './ping.js';

// Register built-in commands
commandLoader.registerCommand(pingCommand);

export {
  CommandLoader,
  commandLoader
};

export default {
  CommandLoader,
  commandLoader
};
