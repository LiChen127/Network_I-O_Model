/**
 * 指标收集
 */
export class Metrics {
  private startTime: number;

  private stats: {
    connections: number;
    requests: number;
    errors: number;
    latencies: number[];
  };

  constructor() {
    this.startTime = Date.now();
    this.stats = {
      connections: 0,
      requests: 0,
      errors: 0,
      latencies: []
    };
  }

  /**
   * 记录连接数
   */
  public recordConnection() {
    this.stats.connections++;
  }

  /**
   * 记录请求数
   */
  public recordRequest(latency: number) {
    this.stats.requests++;
    this.stats.latencies.push(latency);
  }

  /**
   * 记录错误数
   */
  public recordError() {
    this.stats.errors++;
  }

  /**
   * 获取状态
   */
  public getStats() {
    const duration = (Date.now() - this.startTime) / 1000; // 转换为秒
    const avgLatency = this.calculateAvgLatency();

    return {
      duration,
      connections: this.stats.connections,
      requests: this.stats.requests,
      errors: this.stats.errors,
      avgLatency, // 添加平均延迟
      rps: this.stats.requests / duration, // 请求数/持续时间即 每秒请求数
    }
  }

  /**
   * 计算平均延迟
   */
  private calculateAvgLatency(): number {
    if (this.stats.latencies.length === 0) {
      return 0;
    }
    const sum = this.stats.latencies.reduce((acc, curr) => acc + curr, 0);
    return sum / this.stats.latencies.length;
  }
}