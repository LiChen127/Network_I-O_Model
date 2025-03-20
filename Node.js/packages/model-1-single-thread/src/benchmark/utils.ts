import { createConnection, Socket } from 'net';
import { logger } from '../utils/logger';

/**
 * 测试TCP配置项
 */
export interface BenchmarkOptions {
  host: string;
  port: number;
  connections: number;
  duration: number;
  messageSize: number;
}
/**
 * TCP性能测试结果
 */
export interface BenchmarkResult {
  totalRequests: number; // 总请求数
  successfulRequests: number; // 成功请求数
  failedRequests: number; // 失败请求数
  averageLatency: number; // 平均延迟
  throughput: number; // 吞吐量
  errors: string[]; // 错误量
}
/**
 * TCP性能测试类
 */
export class TCPBenchmark {
  private options: BenchmarkOptions;
  private results: BenchmarkResult;
  private clients: Socket[] = []; // 客户端列表
  private startTime: number = 0; // 开始时间 
  private latencies: number[] = []; // 延迟列表

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
  /**
   * 创建连接池
   */
  private async createConnections(): Promise<void> {
    // 并发连接池
    const promises = Array(this.options.connections)
      .fill(null)
      .map(() => this.createConnection());

    await Promise.all(promises);
  }
  /**
   * 创建连接
   * @returns
   */
  private createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = createConnection(
        { host: this.options.host, port: this.options.port },
        () => {
          // 添加到客户端列表
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
  /**
   * 开始请求
   */
  private startRequests(): void {
    this.clients.forEach((client) => {
      // 发送请求
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
  /**
   * 等待所有请求完成
   * @returns 
   */
  private async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, this.options.duration * 1000);
    });
  }
  /**
   * 计算结果
   */
  private calculateResults(): void {
    // 整个请求时间: 秒
    const duration = (Date.now() - this.startTime) / 1000;
    // 每秒请求数
    this.results.throughput = this.results.successfulRequests / duration;
    // 平均延迟
    this.results.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  private cleanup(): void {
    this.clients.forEach((client) => client.end());
    this.clients = [];
  }
} 