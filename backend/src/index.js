import { env, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  validateEnv();
  await connectDB();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
