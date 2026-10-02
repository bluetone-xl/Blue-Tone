import registerBuiltinCommands from './builtin.js';
import registerWarningCommands from './warnings.js';
import registerGroupAdminCommands from './group-admin.js';
import registerOwnerCommands from './owner.js';
import registerMemberCommands from './members.js';
import registerOwnerProfileCommands from './owner-profile.js';

export function registerAllCommands(runtime) {
  registerBuiltinCommands(runtime);
  registerWarningCommands(runtime);
  registerGroupAdminCommands(runtime);
  registerOwnerCommands(runtime);
  registerMemberCommands(runtime);
  registerOwnerProfileCommands(runtime);
}

export default registerAllCommands;
