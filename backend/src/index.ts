import { config } from './config.js';
import { createApp } from './app.js';

const { app } = createApp();

app.listen(config.port, () => {
  console.log(`Snake API server running on http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});
