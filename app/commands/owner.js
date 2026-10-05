import db from '../database/connection.js';
import { isBotOwner } from '../core/auth.js';

export default function registerOwnerCommands(runtime) {
  try {
    if (!runtime || typeof runtime.registerCommand !== 'function') {
      console.warn('⚠️ [OwnerCommands] Runtime or registerCommand method is missing.');
      return;
    }

    runtime.registerCommand({
      name: 'stats',
      execute: async (ctx) => {
        try {
          if (!isBotOwner(ctx.senderId)) {
            return { text: '❌ Unauthorized: Only Bot Owner can view system statistics.' };
          }

          const usersCount = await db.query('SELECT COUNT(*) FROM users;');
          const groupsCount = await db.query('SELECT COUNT(*) FROM groups;');
          const logsCount = await db.query('SELECT COUNT(*) FROM logs;');

          const totalSeconds = Math.floor(process.uptime());
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

          return {
            text: `📊 **BlueTone System Statistics**\n\n` +
                  `• **Registered Users:** ${usersCount.rows[0]?.count || 0}\n` +
                  `• **Active Groups:** ${groupsCount.rows[0]?.count || 0}\n` +
                  `• **Total Processed Logs:** ${logsCount.rows[0]?.count || 0}\n` +
                  `• **Node.js Version:** \`${process.version}\`\n` +
                  `• **Process Uptime:** ${uptimeFormatted}`
          };
        } catch (err) {
          console.error('Error in stats command:', err);
          return { text: `❌ Failed to fetch system statistics: ${err.message}` };
        }
      }
    });

    console.log('✅ [OwnerCommands] Owner commands registered successfully.');
  } catch (err) {
    console.error('❌ [OwnerCommands] Module initialization failed:', err.message);
  }
}
