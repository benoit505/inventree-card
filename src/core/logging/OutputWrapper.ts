import { LogLevel } from '../../types';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  error: 'color: #F44336; font-weight: bold;',
  warn: 'color: #FFC107;',
  info: 'color: #2196F3;',
  debug: 'color: #9E9E9E; font-style: italic;',
  verbose: 'color: #795548; font-style: italic;',
};

/**
 * A simple wrapper around the console API to format and colorize log output.
 * All logging from the ConditionalLoggerEngine will be routed through this class.
 */
export class OutputWrapper {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  public static log(level: LogLevel, category: string, functionName: string, message: string, ...args: unknown[]): void {
    const style = LOG_LEVEL_COLORS[level] || '';
    const groupLabel = `%c[${this.getTimestamp()}][${category}:${functionName}] ${message}`;

    console.groupCollapsed(groupLabel, style);
    args.forEach(arg => console.log(arg));
    console.groupEnd();
  }

  public static error(category: string, functionName: string, message: string, error?: Error, ...args: unknown[]): void {
    const style = LOG_LEVEL_COLORS.error;
    const groupLabel = `%c[${this.getTimestamp()}][${category}:${functionName}] ${message}`;

    console.groupCollapsed(groupLabel, style);
    if (error) {
      console.error(error);
    }
    args.forEach(arg => console.log(arg));
    console.groupEnd();
  }

  public static group(label: string) {
    console.group(label);
  }

  public static groupEnd() {
    console.groupEnd();
  }
} 