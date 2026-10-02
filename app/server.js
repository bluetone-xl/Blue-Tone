import express from 'express';
import bootstrap from './core/bootstrap.js';
import db from './database/connection.js';

const app = express();
app.use(express.json());

const runtime = bootstrap.createRuntime();

app.post('/extension/events', async (req, res) => {
  try {
    const result = await runtime.extensionEvents.handle(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/extension/sync-tasks', async (req, res) => {
  try {
    const tasks = await db.query(
      "SELECT key, state_data FROM appstates WHERE key LIKE 'pending_%';"
    );
    
    if (tasks.rows.length > 0) {
      await db.query("DELETE FROM appstates WHERE key LIKE 'pending_%';");
    }

    res.json({ success: true, tasks: tasks.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', system: 'BlueTone Engine Operational' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 BlueTone Bot running on port ${PORT}`);
});
