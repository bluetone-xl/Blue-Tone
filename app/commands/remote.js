import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'remote',
  description: 'Execute commands in target remote threads from the Control Room (Owner Only)',
  category: 'owner',
  ownerOnly: true,
  async execute({ api, event, args, commandLoader }) {
    const { threadID, senderID, messageID } = event;

    try {
      // Access Control: Strict Owner Check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: Restricted to the Bot Owner.', threadID, messageID);
      }

      // Must be inside or configured for the Control Room
      if (!Permissions.isManagementGroup(threadID)) {
        return api.sendMessage('⚠️ The `!remote` command can only be executed from the Management Control Room.', threadID, messageID);
      }

      const targetThreadId = args[0];
      const targetCmdName = args[1] ? args[1].toLowerCase() : null;
      const cmdArgs = args.slice(2);

      if (!targetThreadId || !targetCmdName) {
        return api.sendMessage(
          "⚠️ Remote Control Usage:\n" +
          "• `!remote <Target_Thread_ID> <command> [args]`\n\n" +
          "Example:\n" +
          "• `!remote 123456789 setname New Group Name`\n" +
          "• `!remote 123456789 groupdestroy`",
          threadID, messageID
        );
      }

      const command = commandLoader.getCommand(targetCmdName);
      if (!command) {
        return api.sendMessage(`❌ Target command '${targetCmdName}' not found.`, threadID, messageID);
      }

      // Mock an event context targeted at the remote thread
      const remoteEvent = {
        ...event,
        threadID: targetThreadId,
        args: cmdArgs,
        isRemote: true
      };

      api.sendMessage(`⏳ Executing remote command \`!${targetCmdName}\` in thread ${targetThreadId}...`, threadID, messageID);

      // Execute target command in remote thread
      await command.execute({ api, event: remoteEvent, args: cmdArgs, commandLoader });

      return api.sendMessage(`✅ [REMOTE EXECUTION SUCCESS] Command \`!${targetCmdName}\` delivered to thread ${targetThreadId}.`, threadID, messageID);

    } catch (error) {
      Logger.error('REMOTE_CMD_ERR', 'Error executing remote command:', error.message);
      return api.sendMessage(`❌ Remote execution failed: ${error.message}`, threadID, messageID);
    }
  }
};
