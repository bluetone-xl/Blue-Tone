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

export function createRuntime() {
  const runtime = new BotRuntime();

  // Owner Commands
  runtime.registerCommand(setbioCmd);
  runtime.registerCommand(postCmd);
  runtime.registerCommand(globalCmd);

  // Utility Commands
  runtime.registerCommand(pingCmd);
  runtime.registerCommand(prefixCmd);
  runtime.registerCommand(helpCmd);
  runtime.registerCommand(setnoticeCmd);

  // Group Admin & Security Commands
  runtime.registerCommand(groupCmd);
  runtime.registerCommand(securityCmd);
  runtime.registerCommand(addCmd);
  runtime.registerCommand(requestsCmd);

  return runtime;
}

export default createRuntime;
