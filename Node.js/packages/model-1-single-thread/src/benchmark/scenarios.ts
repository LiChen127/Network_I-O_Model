/**
 * 测试定义
 */

export interface TestScenario {
  name: string;
  connections: number;
  duration: number;
  pipelining: number;
}

export const scenarios: TestScenario[] = [
  {
    name: '轻负载测试',
    connections: 10,
    duration: 30,
    pipelining: 1
  },
  {
    name: '中负载测试',
    connections: 50,
    duration: 30,
    pipelining: 1
  },
  {
    name: '高负载测试',
    connections: 200,
    duration: 30,
    pipelining: 1
  }
];