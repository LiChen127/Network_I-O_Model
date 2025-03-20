/**
 * 日志工具
 */
class Logger {
  private static formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level}: ${message} ${args.map(arg => JSON.stringify(arg)).join(' ')}`;
  }

  static info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message, ...args));
  }

  static error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args));
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args));
  }

  static debug(message: string, ...args: any[]): void {
    console.debug(this.formatMessage('DEBUG', message, ...args));
  }
}

export const logger = Logger;