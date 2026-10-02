import db from '../database/connection.js';

export default function registerOwnerCommands(runtime) {
  runtime.registerCommand({
    name: 'stats',
    execute: async (ctx) => {
      const usersCount = await db.query('SELECT COUNT(*) FROM users;');
      const groupsCount = await db.query('SELECT COUNT(*) FROM groups;');
      const logsCount = await db.query('SELECT COUNT(*) FROM logs;');

      const uptime = Math.floor(process.uptime());

      return {
        text: `📊 *BlueTone System Statistics*\n\n` +
              `• Registered Users: ${usersCount.rows[0].count}\n` +
              `• Active Groups: ${groupsCount.rows[0].count}\n` +
              `• Total Processed Logs: ${logsCount.rows[0].count}\n` +
              `• Node.js Version: ${process.version}\n` +
              `• Process Uptime: ${uptime}s`
      };
    }
  });
}
