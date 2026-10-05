import { createRuntime } from './app/core/bootstrap.js';
import FBClient from './app/integrations/meta/fb-client.js';

async function main() {
  console.log('🤖 Starting BlueTone Bot Initialization...');

  try {
    // 1. Core Runtime Init
    const runtime = createRuntime();
    console.log('✅ Core Runtime & Event Router Loaded.');

    // 2. FB Client Init & AppState Login
    const client = new FBClient(runtime);
    await client.start();

  } catch (error) {
    console.error('💥 Critical Startup Error:', error);
    process.exit(1);
  }
}

main();
