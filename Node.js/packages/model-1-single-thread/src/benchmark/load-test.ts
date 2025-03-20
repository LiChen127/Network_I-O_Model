/**
 * 负载测试
 */
import { SingleThreadServer } from '../server';
import { TCPBenchmark, BenchmarkOptions } from './utils';
import { logger } from '../utils/logger';

const PORT = 3000;
const HOST = 'localhost';

async function waitForServer(host: string, port: number, maxAttempts: number = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const net = require('net');
      await new Promise((resolve, reject) => {
        const client = net.createConnection({ host, port }, () => {
          client.end();
          resolve(true);
        });
        client.on('error', reject);
      });
      return true;
    } catch (err) {
      logger.info(`等待服务器启动... 尝试 ${i + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function runLoadTest() {
  // 启动服务器
  const server = new SingleThreadServer(PORT);
  server.start();

  // 等待服务器启动
  const isServerReady = await waitForServer(HOST, PORT);
  if (!isServerReady) {
    logger.error('服务器启动失败');
    server.stop();
    process.exit(1);
  }

  // 定义负载测试场景
  const scenarios: BenchmarkOptions[] = [
    {
      host: HOST,
      port: PORT,
      connections: 200,
      duration: 30,
      messageSize: 64
    },
    {
      host: HOST,
      port: PORT,
      connections: 500,
      duration: 30,
      messageSize: 64
    },
    {
      host: HOST,
      port: PORT,
      connections: 1000,
      duration: 30,
      messageSize: 64
    }
  ];

  // 运行负载测试场景
  for (const scenario of scenarios) {
    logger.info(`开始负载测试场景: ${JSON.stringify(scenario, null, 2)}`);
    const benchmark = new TCPBenchmark(scenario);
    const results = await benchmark.run();

    logger.info('负载测试结果:', {
      ...results,
      throughput: `${results.throughput.toFixed(2)} req/s`,
      averageLatency: `${results.averageLatency.toFixed(2)}ms`,
      errorRate: `${((results.failedRequests / results.totalRequests) * 100).toFixed(2)}%`
    });

    // 等待一段时间再开始下一个场景
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // 停止服务器
  server.stop();
}

runLoadTest().catch(err => {
  logger.error('负载测试失败:', err);
  process.exit(1);
});