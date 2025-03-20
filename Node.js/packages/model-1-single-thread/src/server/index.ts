import { createServer, Server, Socket } from "net";
import { logger } from '../utils/logger';
import { Metrics } from '../utils/metrics';

export class SingleThreadServer {
  private server: Server;
  private metrics: Metrics;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.metrics = new Metrics();
    this.server = createServer(this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket): void {
    this.metrics.recordConnection();
    logger.info(`新连接: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data: Buffer) => {
      const startTime = Date.now();
      this.metrics.recordRequest(0); // 临时记录，后续会更新实际延迟

      // 简单的回显服务
      socket.write(data, () => {
        const latency = Date.now() - startTime;
        this.metrics.recordRequest(latency);
      });
    });

    socket.on('error', (err: Error) => {
      this.metrics.recordError();
      logger.error(`连接错误: ${err.message}`);
    });

    socket.on('close', () => {
      logger.info(`连接关闭: ${socket.remoteAddress}:${socket.remotePort}`);
    });
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`服务器启动在端口 ${this.port}`);
    });
  }

  public stop(): void {
    this.server.close(() => {
      logger.info('服务器已停止');
      const stats = this.metrics.getStats();
      // const result = 
      logger.info('性能统计:', stats);
    });
  }
}

