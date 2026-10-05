import Permissions from '../security/permissions.js';
import Logger from '../core/logger.js';

export default {
  name: 'vip',
  description: 'Interactive VIP role assignment and granular command permissions (Owner Only)',
  category: 'owner',
  ownerOnly: true,
  async execute({ api, event, args, commandLoader }) {
    const { threadID, senderID, messageID, mentions, type, messageReply } = event;

    try {
      // Access Control: Strict Bot Owner check
      if (!Permissions.isOwner(senderID)) {
        return api.sendMessage('⚠️ Access Denied: This command is strictly restricted to the Bot Owner.', threadID, messageID);
      }

      const action = args[0] ? args[0].toLowerCase() : null;

      // -------------------------------------------------------------
      // CASE 1: Handle Reply to Active Menu Selection
      // -------------------------------------------------------------
      if (type === 'message_reply' && messageReply) {
        const replyText = messageReply.body || '';

        // Verify if replying to a VIP promotion menu
        if (replyText.includes('👑 VIP Permission Menu')) {
          const targetUidMatch = replyText.match(/Target UID:\s*(\d+)/);
          if (!targetUidMatch) {
            return api.sendMessage('❌ Invalid VIP promotion session.', threadID, messageID);
          }

          const targetUid = targetUidMatch[1];
          const commands = commandLoader.getAllCommands();
          const selectedInput = event.body.trim().toLowerCase();

          let selectedCmds = [];

          if (selectedInput === 'all') {
            selectedCmds = ['all'];
          } else {
            // Parse comma-separated numbers (e.g., "1, 3, 5")
            const indices = selectedInput.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            
            indices.forEach(idx => {
              if (idx > 0 && idx <= commands.length) {
                selectedCmds.push(commands[idx - 1].name);
              }
            });
          }

          if (selectedCmds.length === 0) {
            return api.sendMessage('⚠️ Invalid selection. Please reply with valid numbers (e.g., `1, 3, 5`) or `all`.', threadID, messageID);
          }

          // Save granted permissions to VIP database map
          Permissions.setVipPermissions(targetUid, selectedCmds);

          const grantedList = selectedCmds.includes('all') ? 'ALL COMMANDS' : selectedCmds.map(c => `!${c}`).join(', ');
          return api.sendMessage(
            `✅ [VIP PROMOTED]\n━━━━━━━━━━━━━━━━━━\n` +
            `👤 Target UID: ${targetUid}\n` +
            `🔑 Granted Permissions: ${grantedList}`,
            threadID, messageID
          );
        }
      }

      // -------------------------------------------------------------
      // CASE 2: Revoke VIP Status (`!vip demote @mention`)
      // -------------------------------------------------------------
      if (action === 'demote') {
        let targetUid = null;
        if (mentions && Object.keys(mentions).length > 0) {
          targetUid = Object.keys(mentions)[0];
        } else if (args[1] && !isNaN(args[1])) {
          targetUid = args[1];
        }

        if (!targetUid) {
          return api.sendMessage('⚠️ Please mention a user or provide a valid UID to demote.', threadID, messageID);
        }

        Permissions.revokeVip(targetUid);
        return api.sendMessage(`✅ [VIP REVOKED] Removed VIP permissions for UID: ${targetUid}`, threadID, messageID);
      }

      // -------------------------------------------------------------
      // CASE 3: Initiate Interactive Menu (`!vip promote @mention`)
      // -------------------------------------------------------------
      if (action === 'promote') {
        let targetUid = null;
        if (mentions && Object.keys(mentions).length > 0) {
          targetUid = Object.keys(mentions)[0];
        } else if (args[1] && !isNaN(args[1])) {
          targetUid = args[1];
        }

        if (!targetUid) {
          return api.sendMessage('⚠️ Please mention a user or provide a valid UID to promote.', threadID, messageID);
        }

        const commands = commandLoader.getAllCommands();
        let menuMsg = 
          `👑 VIP Permission Menu\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `🎯 Target UID: ${targetUid}\n\n` +
          `Select the commands to grant by replying to this message with number(s) (e.g., 1, 3, 5 or all):\n\n`;

        commands.forEach((cmd, idx) => {
          menuMsg += `${idx + 1}. !${cmd.name} - ${cmd.description || 'No description'}\n`;
        });

        menuMsg += `\n💬 Reply to this message with the selection.`;

        return api.sendMessage(menuMsg, threadID, messageID);
      }

      // Default Usage Guide
      return api.sendMessage(
        "⚠️ VIP System Usage:\n" +
        "• `!vip promote @mention` - Open interactive command selection menu\n" +
        "• `!vip demote @mention` - Revoke VIP status",
        threadID, messageID
      );

    } catch (error) {
      Logger.error('VIP_CMD_ERR', 'Error executing VIP command:', error.message);
      return api.sendMessage(`❌ Failed to process VIP command: ${error.message}`, threadID, messageID);
    }
  }
};
