import express from 'express';
import { Logger, runtime, db } from './core/index.js';

const app = express();
app.use(express.json());

/**
 * Route: Extension Events Handler
 */
app.post('/extension/events', async (req, res) => {
  try {
    if (runtime.eventListener) {
      const result = await runtime.eventListener.handleEvent(req.body, runtime.messenger?.api);
      return res.json({ success: true, data: result });
    }
    return res.status(503).json({ success: false, error: 'Runtime event listener not ready' });
  } catch (error) {
    Logger.error('SERVER', 'Error processing extension event:', error?.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Route: Extension Sync Tasks
 */
app.get('/extension/sync-tasks', async (req, res) => {
  try {
    const pendingTasks = db.get('pending_appstates', []);
    
    // Clear pending tasks upon consumption
    if (pendingTasks.length > 0) {
      await db.set('pending_appstates', []);
    }

    return res.json({ success: true, tasks: pendingTasks });
  } catch (error) {
    Logger.error('SERVER', 'Error fetching sync tasks:', error?.message || error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Route: System Health Check
 */
app.get('/health', (_req, res) => {
  return res.json({
    status: 'OK',
    system: 'BlueTone Engine Operational',
    isRuntimeReady: runtime.isReady,
    timestamp: new Date().toISOString()
  });
});

/**
 * Express Application Bootstrapper
 */
const PORT = process.env.PORT || 3000;

export const startServer = async () => {
  // Boot system runtime kernel first
  await runtime.boot();

  app.listen(PORT, () => {
    Logger.info('SERVER', `🚀 BlueTone Bot server running on port ${PORT}`);
  });
};

// Auto-start if directly executed
startServer();

export default app;
