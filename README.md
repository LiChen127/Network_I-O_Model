# 模拟常见的Linux网络I/O并发模型

## 实现语言

1. Node.js
2. Java
3. Go

## 常见的模型

1. 单线程Accept(无I/O复用)
2. 单线程Accept + 多线程读写业务(无I/O复用)
3. 单线程多路I/O复用
4. 单线程多路I/O复用 + 多线程读写业务(业务工作池)
5. 单线程I/O复用 + 多线程I/O复用(连接线程池)
6. (进程版): 单进程多线程I/O复用 + 多进程I/O复用

## 测试指标

### 核心的测试指标

1. 性能指标: 衡量系统处理请求的能力和响应部分
   1. 吞吐量(QPS/TPS)
   2. 响应时间(RT)
   3. 平均延迟
   4. P99延迟
2. 资源消耗:
   1. CPU占用率
   2. 内存占用率
   3. 线程/进程数
   4. 上下文切换次数
3. 稳定性指标:
   1. 长连接保持能力
   2. 错误率

### 测试场景设计

1. 负载类型:
   1. 短连接场景: 模拟HTTP短链接
   2. 长连接场景: 模拟WS长链接
   3. 混合场景: 模拟HTTP短链接和WS长链接混合
2. 数据特征:
   1. 小数据包: 1KB以内
   2. 中数据包: 1MB以上
   3. 突发数据包: 1W个以上
3. 压力级别:
   1. 低并发: 100以下
   2. 中等并发: 1k-10k并发
   3. 高并发: 10k以上

## Node.js实现设计思路

### 单线程Accept

由于Node.js中的I/O模型利用libuv自动使用epoll/kqueue等系统调用，所以我们实现的实际上是单线程Accept + I/O复用。

### 单线程Accept + 多线程读写任务

