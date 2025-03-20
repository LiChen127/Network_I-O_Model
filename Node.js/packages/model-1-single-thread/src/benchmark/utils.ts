import { createConnection, Socket } from 'net';
import { logger } from '../utils/logger';

export interface BenchmarkOptions {
  host: string;
  port: number;
  connections: number;
  duration: number;
  messageSize: number;
}

export interface BenchmarkResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  throughput: number;
  errors: string[];
}

export class TCPBenchmark {
  private options: BenchmarkOptions;
  private results: BenchmarkResult;
  private clients: Socket[] = [];
  private startTime: number = 0;
  private latencies: number[] = [];

  constructor(options: BenchmarkOptions) {
    this.options = options;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      throughput: 0,
      errors: []
    };
  }

  public async run(): Promise<BenchmarkResult> {
    logger.info('开始基准测试...');
    this.startTime = Date.now();

    // 创建连接池
    await this.createConnections();

    // 开始发送请求
    this.startRequests();

    // 等待测试完成
    await this.waitForCompletion();

    // 计算结果
    this.calculateResults();

    // 清理连接
    this.cleanup();

    return this.results;
  }

  private async createConnections(): Promise<void> {
    const promises = Array(this.options.connections)
      .fill(null)
      .map(() => this.createConnection());

    await Promise.all(promises);
  }

  private createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = createConnection(
        { host: this.options.host, port: this.options.port },
        () => {
          this.clients.push(client);
          resolve();
        }
      );

      client.on('error', (err) => {
        this.results.errors.push(`连接错误: ${err.message}`);
        reject(err);
      });
    });
  }

  private startRequests(): void {
    this.clients.forEach((client) => {
      const message = Buffer.alloc(this.options.messageSize, 'x');

      const sendRequest = () => {
        const startTime = Date.now();
        this.results.totalRequests++;

        client.write(message, (err) => {
          if (err) {
            this.results.failedRequests++;
            this.results.errors.push(`发送错误: ${err.message}`);
          } else {
            this.results.successfulRequests++;
            const latency = Date.now() - startTime;
            this.latencies.push(latency);
          }
        });
      };

      // 持续发送请求直到测试结束
      const interval = setInterval(sendRequest, 1000 / this.options.connections);

      // 测试结束后清理
      setTimeout(() => clearInterval(interval), this.options.duration * 1000);
    });
  }

  private async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, this.options.duration * 1000);
    });
  }

  private calculateResults(): void {
    const duration = (Date.now() - this.startTime) / 1000;
    this.results.throughput = this.results.successfulRequests / duration;
    this.results.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  private cleanup(): void {
    this.clients.forEach((client) => client.end());
    this.clients = [];
  }
} 