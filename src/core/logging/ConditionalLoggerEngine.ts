import { ILogger, GlobalLogSettings, LogLevel, LoggerCategorySettings, LogEntry } from '../../types';
import { OutputWrapper } from './OutputWrapper';
import { 
  registerLogCategoriesBatchForInstance, 
  initializeEditorLogger,
  logFired,
} from '../../store/slices/loggingSlice';
import { AppDispatch, RootState } from '../../store';
import { v4 as uuidv4 } from 'uuid';

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
    private instanceId: string
  ) {}

  private _shouldLog(level: LogLevel): boolean {
    if (level === 'verbose') {
      return this.engine.isVerbose(this.category);
    }
    return this.engine.shouldLog(this.category, level);
  }

  // Helper to format and style console output
  private _logToConsole(level: LogLevel, category: string, instanceId: string, functionName: string, message: string, ...args: unknown[]): void {
    const styles: Record<LogLevel, string> = {
      verbose: 'color: #9E9E9E;', // Grey
      debug: 'color: #2196F3;', // Blue
      info: 'color: #4CAF50;', // Green
      warn: 'color: #FFC107;', // Amber
      error: 'color: #F44336; font-weight: bold;', // Red, bold
    };

    const style = styles[level] || 'color: #FFFFFF;';
    const instancePart = instanceId === 'TEMPORARY' || instanceId === 'GLOBAL' ? '' : ` [${instanceId}]`;
    
    console.log(`%c[${category}${instancePart}] (${functionName})`, style, message, ...args);
  }

  public debug(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    if (this._shouldLog('debug')) {
      const msg = typeof message === 'function' ? message() : message;
      this.engine.captureLog({ id: uuidv4(), timestamp: new Date().toISOString(), category: this.category, level: 'debug', functionName, message: msg, args }, this.instanceId);
      this._logToConsole('debug', this.category, this.instanceId, functionName, msg, ...args);
    }
  }

  public info(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    if (this._shouldLog('info')) {
      const msg = typeof message === 'function' ? message() : message;
      this.engine.captureLog({ id: uuidv4(), timestamp: new Date().toISOString(), category: this.category, level: 'info', functionName, message: msg, args }, this.instanceId);
      this._logToConsole('info', this.category, this.instanceId, functionName, msg, ...args);
    }
  }

  public warn(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    if (this._shouldLog('warn')) {
      const msg = typeof message === 'function' ? message() : message;
      this.engine.captureLog({ id: uuidv4(), timestamp: new Date().toISOString(), category: this.category, level: 'warn', functionName, message: msg, args }, this.instanceId);
      this._logToConsole('warn', this.category, this.instanceId, functionName, msg, ...args);
    }
  }

  public error(functionName: string, message: string | (() => string), error?: Error, ...args: unknown[]): void {
    if (this._shouldLog('error')) {
      const msg = typeof message === 'function' ? message() : message;
      const finalArgs = error ? [error, ...args] : args;
      this.engine.captureLog({ id: uuidv4(), timestamp: new Date().toISOString(), category: this.category, level: 'error', functionName, message: msg, args: finalArgs }, this.instanceId);
      this._logToConsole('error', this.category, this.instanceId, functionName, msg, ...finalArgs);
    }
  }

  public verbose(functionName: string, message: string | (() => string), ...args: unknown[]): void {
    if (this._shouldLog('verbose')) {
      const msg = typeof message === 'function' ? message() : message;
      this.engine.captureLog({ id: uuidv4(), timestamp: new Date().toISOString(), category: this.category, level: 'verbose', functionName, message: msg, args }, this.instanceId);
      this._logToConsole('verbose', this.category, this.instanceId, functionName, msg, ...args);
    }
  }

  public group(label: string): void {
    if (this._shouldLog('info')) { // Groups are generally used for info-level
      OutputWrapper.group(label);
    }
  }

  public groupEnd(): void {
    if (this._shouldLog('info')) {
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
    return new Logger(category, this, cardInstanceId || 'GLOBAL');
  }

  public getTemporaryLogger(category: string): ILogger {
    return new Logger(category, this, 'TEMPORARY');
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

  public captureLog(logEntry: LogEntry, instanceId: string): void {
    if (this.dispatch) {
      // Dispatch the logFired action, spreading the logEntry and adding the instanceId
      // This matches the payload expected by the logFired reducer.
      this.dispatch(logFired({ ...logEntry, cardInstanceId: instanceId }));
    }
  }
} 