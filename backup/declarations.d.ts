// Declaration file for modules referenced in backup files
// This allows TypeScript to compile without errors even though the implementations exist elsewhere

// Use absolute module paths for ambient declarations
declare module 'inventree-card/core/inventree-state' {
  export class InventTreeState {
    static getInstance(): InventTreeState;
    setHassData(entityId: string, data: any[]): void;
    trackLastUpdate(source: string, entityId: string): void;
    updateParameter(partId: number, paramName: string, value: string): void;
    findEntityForPart(partId: number): string | undefined;
    // Add any other required methods/properties as needed
  }
}

declare module 'inventree-card/services/rendering-service' {
  export interface RenderTimingData {
    component: string;
    preparationTime?: number;
    renderTime?: number;
    filteredParts?: number;
    totalParts?: number;
    timestamp?: number;
  }
  
  export class RenderingService {
    static getInstance(): RenderingService;
    restartIdleTimer(): void;
    trackRenderTiming(data: RenderTimingData): void;
    forceRender(): void;
    // Add any other required methods/properties as needed
  }
}

declare module 'inventree-card/utils/logger' {
  export interface LogOptions {
    category?: string;
    subsystem?: string;
    [key: string]: any;
  }
  
  export class Logger {
    static getInstance(): Logger;
    // Note: Using rest parameters to allow any error object to be passed
    log(component: string, message: string, optionsOrError?: LogOptions | any, ...args: any[]): void;
    error(component: string, message: string, optionsOrError?: LogOptions | any, ...args: any[]): void;
    warn(component: string, message: string, optionsOrError?: LogOptions | any, ...args: any[]): void;
    // Add any other required methods as needed
  }
}

declare module 'inventree-card/services/cache' {
  export enum CacheCategory {
    ENTITY = 'entity',
    PARAMETER = 'parameter',
    RENDER = 'render',
    WEBSOCKET = 'websocket',
    CONDITION = 'condition',
    GENERAL = 'general'
  }
  
  export const DEFAULT_TTL: {
    ENTITY_DATA: number;
    PARAMETER: number;
    RENDER_DEDUP: number;
    WS_DEDUP: number;
    CONDITION: number;
    FALLBACK: number;
  };
  
  export class CacheService {
    static getInstance(): CacheService;
    set(key: string, value: any, ttlMs?: number, category?: CacheCategory): void;
    get<T>(key: string, useFallback?: boolean): T | undefined;
    has(key: string): boolean;
    setFallback(key: string, value: any): void;
    delete(key: string): void;
    prune(): void;
    clear(): void;
    // Add any other required methods as needed
  }
}

declare module 'inventree-card/services/parameter-service' {
  export class ParameterService {
    static getInstance(): ParameterService;
    static hasInstance(): boolean;
    static markParameterChanged(entityId: string, paramName: string): void;
    findEntityForPart(partId: number): string | undefined;
    storeOrphanedParameter(partId: number, paramName: string, value: string): void;
    // Add any other required methods as needed
  }
}

declare module 'inventree-card/core/types' {
  export interface InventreeItem {
    pk: number;
    name: string;
    in_stock: number;
    // Add any other required properties as needed
  }
  
  // Add other required interfaces or types as needed
}

declare module 'inventree-card/services/api' {
  export class InvenTreeDirectAPI {
    // Add any required methods/properties as needed
  }
}

// Add modules from node_modules that have missing declarations
declare module 'custom-card-helpers/translations/localize' {
  export type LocalizeFunc = (key: string, ...args: any[]) => string;
}

// React types extended to handle errors
declare module 'react' {
  export type MemoExoticComponent<T> = React.ComponentType<T>;
  export type ForwardRefExoticComponent<T> = React.ComponentType<T>;
  export type Context<T> = React.ComponentType<T>;
  export type ReactNode = any;
  export namespace JSX {
    export type Element = any;
    export type LibraryManagedAttributes<C, P> = any;
  }
  export type ComponentType<P> = any;
  export type ComponentClass<P> = any;
  export type ClassAttributes<T> = any;
  export type FunctionComponent<P> = any;
} 