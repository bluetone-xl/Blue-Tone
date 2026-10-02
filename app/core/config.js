import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botOwnerUid: process.env.BOT_OWNER_UID || '',
  defaultPrefix: process.env.DEFAULT_PREFIX || '!',
  timezone: process.env.TIMEZONE || 'Asia/Dhaka',
  botName: process.env.BOT_NAME || 'BlueTone Bot',

  extension: {
    enabled: true,
    baseUrl: process.env.EXTENSION_BASE_URL || '',
    apiKey: process.env.EXTENSION_API_KEY || '',
    connectionId: process.env.EXTENSION_CONNECTION_ID || ''
  }
};

export default config;
