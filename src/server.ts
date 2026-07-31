import { Server } from 'http';
import app from './app';
import config from './app/config';

let server: Server;

async function bootstrap() {
  try {
    server = app.listen(config.port, () => {
      console.log(`🚀 GearUp Backend Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Only start listening when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  bootstrap();
}

// Export the Express app for Vercel serverless
export default app;

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection detected:', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Uncaught Exception detected:', error);
  process.exit(1);
});
