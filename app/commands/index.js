import registerBuiltinCommands from './builtin.js';
import registerWarningCommands from './warnings.js';
import registerGroupAdminCommands from './group-admin.js';
import registerOwnerCommands from './owner.js';
import registerMemberCommands from './members.js';
import registerOwnerProfileCommands from './owner-profile.js';

/**
 * Safely registers all module command handlers into the runtime system.
 * @param {Object} runtime - Core bot runtime instance.
 */
export function registerAllCommands(runtime) {
  if (!runtime) {
    console.error('❌ [CommandRegistry] Critical Error: Runtime instance is undefined or null.');
    return;
  }

  const registries = [
    { name: 'BuiltinCommands', fn: registerBuiltinCommands },
    { name: 'WarningCommands', fn: registerWarningCommands },
    { name: 'GroupAdminCommands', fn: registerGroupAdminCommands },
    { name: 'OwnerCommands', fn: registerOwnerCommands },
    { name: 'MemberCommands', fn: registerMemberCommands },
    { name: 'OwnerProfileCommands', fn: registerOwnerProfileCommands }
  ];

  registries.forEach(({ name, fn }) => {
    try {
      if (typeof fn === 'function') {
        fn(runtime);
      } else {
        console.warn(`⚠️ [CommandRegistry] ${name} is not a valid function.`);
      }
    } catch (err) {
      console.error(`❌ [CommandRegistry] Failed to register ${name}:`, err.message);
    }
  });

  console.log('✅ [CommandRegistry] All command modules execution check completed.');
}

export default registerAllCommands;
