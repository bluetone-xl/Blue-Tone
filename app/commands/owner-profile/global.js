import db from '../../database/connection.js';
import { isBotOwner } from '../../core/auth.js';

export default {
  name: 'global',
  description: 'Global control across all groups (Management Group / Owner Only)',
  async execute(ctx) {
    const { senderId, groupId, args, prefix } = ctx;

    if (!isBotOwner(senderId)) {
      return { text: '❌ Unauthorized: Only the Bot Owner can use global management commands.' };
    }

    // Subcommand 1: Set Management Group (!global setmgmt)
    if (args[0] === 'setmgmt') {
      if (!groupId) return { text: '⚠️ Execute this command inside the group you want to set as Management Group.' };
      
      await db.query(
        `INSERT INTO global_settings (key, value) VALUES ('mgmt_group', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1;`,
        [groupId]
      );
      return { text: `🛡️ This group (${groupId}) is now registered as the **Bot Management Group**!` };
    }

    // Check if request is coming from Management Group or direct Owner private chat
    const mgmtRes = await db.query("SELECT value FROM global_settings WHERE key = 'mgmt_group';");
    const mgmtGroupId = mgmtRes.rows[0]?.value;

    if (groupId && mgmtGroupId && groupId !== mgmtGroupId) {
      return { text: '⚠️ Global control commands can only be executed from the designated **Management Group** or Direct Message.' };
    }

    // Subcommand 2: Global Notice Update (!global notice welcome <msg>)
    if (args[0] === 'notice') {
      const type = args[1]?.toLowerCase(); // welcome, leave, remove
      const globalText = args.slice(2).join(' ');

      if (!['welcome', 'leave', 'remove'].includes(type) || !globalText) {
        return { text: `ℹ️ Usage: \`${prefix}global notice <welcome|leave|remove> <message>\`` };
      }

      const column = `${type}_msg`;
      await db.query(`UPDATE groups SET ${column} = $1;`, [globalText]);
      
      return { text: `🌐 **Global Update Applied!** All groups now have updated **${type}** notice:\n"${globalText}"` };
    }

    return { text: `🌐 **Global Commands Help:**\n• \`${prefix}global setmgmt\` - Set current group as Management Group\n• \`${prefix}global notice <welcome|leave|remove> <msg>\` - Set notice for ALL groups` };
  }
};
