import dotenv from 'dotenv';

// Safely load environment variables
try {
  dotenv.config();
} catch (err) {
  console.error('⚠️ [Config] Failed to load .env file:', err.message);
}

/**
 * Builds and returns the sanitized application configuration object.
 * @returns {Object}
 */
function buildConfig() {
  try {
    const rawOwnerUid = process.env.BOT_OWNER_UID || '61594424694266';
    const rawPrefix = process.env.DEFAULT_PREFIX || '!';
    const rawTimezone = process.env.TIMEZONE || 'Asia/Dhaka';
    const rawBotName = process.env.BOT_NAME || 'BlueTone Bot';

    return Object.freeze({
      botOwnerUid: String(rawOwnerUid).trim(),
      defaultPrefix: String(rawPrefix).trim(),
      timezone: String(rawTimezone).trim(),
      botName: String(rawBotName).trim(),

      extension: Object.freeze({
        enabled: process.env.EXTENSION_ENABLED === 'true' || true,
        baseUrl: String(process.env.EXTENSION_BASE_URL || '').trim(),
        apiKey: String(process.env.EXTENSION_API_KEY || '').trim(),
        connectionId: String(process.env.EXTENSION_CONNECTION_ID || '').trim()
      })
    });
  } catch (err) {
    console.error('❌ [Config] Critical error parsing configuration:', err.message);
    
    // Safe fallback configuration
    return Object.freeze({
      botOwnerUid: '61594424694266',
      defaultPrefix: '!',
      timezone: 'Asia/Dhaka',
      botName: 'BlueTone Bot',
      extension: Object.freeze({
        enabled: false,
        baseUrl: '',
        apiKey: '',
        connectionId: ''
      })
    });
  }
}

export const config = buildConfig();
export default config;
