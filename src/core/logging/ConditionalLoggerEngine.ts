import { ILogger, GlobalLogSettings, LogLevel, LoggerCategorySettings, LogEntry } from '../../types';
import { OutputWrapper } from './OutputWrapper';
import { 
  registerLogCategoriesBatchForInstance, 
  initializeEditorLogger,
  logFired,
} from '../../store/slices/loggingSlice';
import { AppDispatch, RootState } from '../../store';

const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

class Logger implements ILogger {
  constructor(
    private category: string, 
    private engine: ConditionalLoggerEngine, 
    private cardInstanceId?: string
  ) {}

  private log(level: LogLevel, functionName: string, message: string | (() => string), ...args: unknown[]): void {
    const msg = typeof message === 'function' ? message() : message;

    // Only dispatch the event if we have an instance ID.
    // This prevents orphan loggers from causing errors in the middleware.
    if (this.cardInstanceId) {
      this.engine.getDispatch()?.(logFired({
        level,
        category: this.category,
        functionName,
        message: msg,
        cardInstanceId: this.cardInstanceId,
        args,
      }));
    }

    // Separately, decide whether to write to the console.
    if (this.engine.shouldLog(this.category, level)) {
      OutputWrapper.log(level, this.category, functionName, msg, ...args);
    }
  }

  debug(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    this.log('debug', functionName, message, ...args);
  }

  info(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    this.log('info', functionName, message, ...args);
  }

  warn(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    this.log('warn', functionName, message, ...args);
  }
  
  error(functionName: string, message: string | (() => string), error?: Error, ...args: unknown[]): void {
    const msg = typeof message === 'function' ? message() : message;
    const allArgs = error ? [error, ...args] : args;

    // Only dispatch if we have an instance ID.
    if (this.cardInstanceId) {
      this.engine.getDispatch()?.(logFired({
        level: 'error',
        category: this.category,
        functionName,
        message: msg,
        cardInstanceId: this.cardInstanceId,
        args: allArgs,
      }));
    }

    // Separately, decide whether to write to the console.
    if (this.engine.shouldLog(this.category, 'error')) {
      OutputWrapper.error(this.category, functionName, msg, error, ...args);
    }
  }
  
  verbose(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    if (this.engine.isVerbose(this.category)) {
      this.log('verbose', functionName, message, ...args);
    }
  }

  group(label: string): void {
    if (this.engine.shouldLog(this.category, 'info')) { // Groups are generally used for info-level
      OutputWrapper.group(label);
    }
  }

  groupEnd(): void {
    if (this.engine.shouldLog(this.category, 'info')) {
      OutputWrapper.groupEnd();
    }
  }
}

class DummyLogger implements ILogger {
  debug() {}
  info() {}
  warn() {}
  error() {}
  verbose() {}
  group() {}
  groupEnd() {}
}

export class ConditionalLoggerEngine {
  private static instance: ConditionalLoggerEngine;
  private settings: GlobalLogSettings = {};
  private registeredCategories: Record<string, LoggerCategorySettings> = {};
  private dispatch: AppDispatch | null = null;
  private lastKnownLoggingState: RootState['logging'] | null = null;

  private constructor() {}

  public static getInstance(): ConditionalLoggerEngine {
    if (!ConditionalLoggerEngine.instance) {
      ConditionalLoggerEngine.instance = new ConditionalLoggerEngine();
    }
    return ConditionalLoggerEngine.instance;
  }

  public setDispatch(dispatch: AppDispatch): void {
    this.dispatch = dispatch;
  }

  public connectToStore(store: any): void {
    store.subscribe(() => {
      const currentState = store.getState();
      const currentLoggingState = currentState.logging;

      if (currentLoggingState !== this.lastKnownLoggingState) {
        this.lastKnownLoggingState = currentLoggingState;
        
        const allSettings: GlobalLogSettings = {};
        for (const instanceId in currentLoggingState.logsByInstance) {
          const instanceSettings = currentLoggingState.logsByInstance[instanceId]?.settings || {};
          Object.assign(allSettings, instanceSettings);
        }
        this.updateSettings(allSettings);
      }
    });
  }

  public registerCategory(categoryName: string, defaultSettings: LoggerCategorySettings, cardInstanceId?: string): void {
    if (!this.registeredCategories[categoryName]) {
      this.registeredCategories[categoryName] = defaultSettings;
      // Initialize with default settings if no override is present
      if (!this.settings[categoryName]) {
          this.settings[categoryName] = defaultSettings;
      }
      
      // If the store is already connected, dispatch the action for the specific instance.
      if (this.dispatch && cardInstanceId) {
        this.dispatch(initializeEditorLogger({ cardInstanceId }));
        this.dispatch(registerLogCategoriesBatchForInstance({ cardInstanceId, categories: { [categoryName]: defaultSettings } }));
      }
    }
  }

  public updateSettings(newSettings: GlobalLogSettings): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getLogger(category: string, cardInstanceId?: string): ILogger {
    // If a logger is requested for a category that hasn't been explicitly registered,
    // register it now with default settings.
    if (!this.registeredCategories[category]) {
      this.registerCategory(category, { enabled: false, level: 'info', verbose: false }, cardInstanceId);
    }
    return new Logger(category, this, cardInstanceId);
  }

  public getTemporaryLogger(category: string): ILogger {
    return new DummyLogger();
  }
  
  public getRegisteredCategories(): Record<string, LoggerCategorySettings> {
    return this.registeredCategories;
  }

  public shouldLog(category: string, level: LogLevel): boolean {
    const categorySettings = this.settings[category];
    if (!categorySettings || !categorySettings.enabled) {
      return false;
    }
    return LOG_LEVEL_HIERARCHY[level] >= LOG_LEVEL_HIERARCHY[categorySettings.level];
  }

  public isVerbose(category: string): boolean {
    const categorySettings = this.settings[category];
    return categorySettings?.enabled && (categorySettings.verbose ?? false);
  }

  public getDispatch(): AppDispatch | null {
    return this.dispatch;
  }
} 