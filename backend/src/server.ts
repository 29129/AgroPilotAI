import { env } from './config/env.js';
import { prisma } from './database/prisma.js';
import { createApp } from './app.js';

const app = createApp();
const server = app.listen(env.PORT, () => console.info(`AgroPilot API listening on port ${env.PORT}`));

async function shutdown(signal: string) {
  console.info(`${signal} received, closing AgroPilot API`);
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
