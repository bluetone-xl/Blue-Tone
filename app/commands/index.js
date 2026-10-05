import db from './app/database/connection.js';
import { updateSchema } from './app/database/update-schema.js';
import { loadAppState } from './app/database/appstate.js';
import { BotRuntime } from './app/core/runtime.js';
import { EventPipeline } from './app/events/index.js';
import { Logger } from './app/core/logger.js';

/**
 * Main application bootstrap function.
 */
async function bootstrap() {
  Logger.info('BOOTSTRAP', '🚀 Initializing BlueTone Bot Application...');

  try {
    // 1. Database Connection & Schema Verification
    Logger.info('DATABASE', 'Checking PostgreSQL database connection...');
    const isConnected = await db.verifyConnection();
    if (!isConnected) {
      Logger.error('DATABASE', 'Failed to connect to the database. Retrying or halting start.');
      process.exit(1);
    }

    Logger.info('DATABASE', 'Ensuring database schemas and tables are up to date...');
    await updateSchema();

    // 2. Initialize Bot Runtime & Event Pipeline
    Logger.info('RUNTIME', 'Initializing BotRuntime instance...');
    const runtime = new BotRuntime();

    Logger.info('EVENTS', 'Setting up EventPipeline...');
    const eventPipeline = new EventPipeline(runtime);

    // 3. Appstate & Session Verification
    Logger.info('APPSTATE', 'Loading persisted Facebook appstate...');
    const appstateData = await loadAppState();

    if (!appstateData || (Array.isArray(appstateData) && appstateData.length === 0)) {
      Logger.warn('APPSTATE', 'No active appstate found in DB. Waiting for extension or manual auth login.');
    } else {
      Logger.success('APPSTATE', 'Appstate successfully loaded into memory.');
    }

    // 4. Bind Global Services
    global.botRuntime = runtime;
    global.eventPipeline = eventPipeline;

    Logger.success('BOOTSTRAP', '🎉 BlueTone Bot system is online and ready for incoming events!');

  } catch (err) {
    Logger.error('BOOTSTRAP', 'Fatal initialization error:', err.message);
    process.exit(1);
  }
}

// Global Process Defensive Fail-Safes (Prevent Termux Crash on Uncaught Errors)
process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT_EXCEPTION', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED_REJECTION', reason?.message || reason);
});

// Start the application
bootstrap();
