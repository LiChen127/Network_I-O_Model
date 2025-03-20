import { SingleThreadServer } from './server';
import { logger } from './utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = new SingleThreadServer(PORT);

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，准备关闭服务器');
  server.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，准备关闭服务器');
  server.stop();
  process.exit(0);
});

server.start(); 