
/**
 * 服务器配置
 */
export interface ServerConfig {
  port: number;
  host?: string;
  backlog?: number;
  keepAliveTimeout?: number;
}
/**
 * 服务器统计信息
 */
export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalRequests: number;
  totalErrors: number;
}