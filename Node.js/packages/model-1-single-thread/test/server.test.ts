import { SingleThreadServer } from '../src/server';
import { createConnection } from 'net';
import { logger } from '../src/utils/logger';

describe('SingleThreadServer', () => {
  let server: SingleThreadServer;
  const TEST_PORT = 3001;

  beforeAll(() => {
    server = new SingleThreadServer(TEST_PORT);
    server.start();
  });

  afterAll(() => {
    server.stop();
  });

  it('应该能够接受连接并回显数据', (done) => {
    const client = createConnection({ port: TEST_PORT }, () => {
      const testData = 'Hello Server';
      client.write(testData);
    });

    client.on('data', (data) => {
      expect(data.toString()).toBe('Hello Server');
      client.end();
      done();
    });
  });
});
