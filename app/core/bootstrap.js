import BotRuntime from './runtime.js';
import setbioCmd from '../commands/owner-profile/setbio.js';
import postCmd from '../commands/owner-profile/post.js';
import globalCmd from '../commands/owner-profile/global.js';

import pingCmd from '../commands/utility/ping.js';
import prefixCmd from '../commands/utility/prefix.js';
import helpCmd from '../commands/utility/help.js';
import setnoticeCmd from '../commands/utility/setnotice.js';

import groupCmd from '../commands/group-admin/group-settings.js';
import securityCmd from '../commands/group-admin/group-security.js';
import addCmd from '../commands/group-admin/member-mgmt.js';
import requestsCmd from '../commands/group-admin/requests.js';

/**
 * Initializes and bootstraps the core bot runtime with all primary commands.
 * @returns {BotRuntime|null} Configured runtime instance or null on failure.
 */
export function createRuntime() {
  try {
    const runtime = new BotRuntime();

    if (!runtime || typeof runtime.registerCommand !== 'function') {
      throw new Error('Failed to instantiate valid BotRuntime instance.');
    }

    const commandModules = [
      // Owner Commands
      setbioCmd,
      postCmd,
      globalCmd,

      // Utility Commands
      pingCmd,
      prefixCmd,
      helpCmd,
      setnoticeCmd,

      // Group Admin & Security Commands
      groupCmd,
      securityCmd,
      addCmd,
      requestsCmd
    ];

    commandModules.forEach((cmd, index) => {
      try {
        if (cmd) {
          runtime.registerCommand(cmd);
        } else {
          console.warn(`⚠️ [Bootstrap] Command module at index ${index} is undefined or null.`);
        }
      } catch (cmdErr) {
        console.error(`❌ [Bootstrap] Error registering command at index ${index}:`, cmdErr.message);
      }
    });

    console.log('✅ [Bootstrap] Bot runtime initialized successfully with core commands.');
    return runtime;
  } catch (err) {
    console.error('❌ [Bootstrap] Critical error creating runtime:', err.message);
    return null;
  }
}

export default createRuntime;
