// Declarations for modules referenced in backup renders files

declare module 'inventree-card/core/types' {
  export interface InventreeItem {
    pk: number;
    name: string;
    in_stock: number;
    minimum_stock?: number;
    thumbnail?: string;
    description?: string;
    full_name?: string;
    parameters?: any[];
    [key: string]: any; // Allow arbitrary properties
  }
  
  export interface InventreeCardConfig {
    type: string;
    entity?: string;
    name?: string;
    view_type?: string;
    display?: {
      show_header?: boolean;
      show_image?: boolean;
      show_name?: boolean;
      show_stock?: boolean;
      show_description?: boolean;
      show_category?: boolean;
      [key: string]: any;
    };
    [key: string]: any; // Allow arbitrary properties
  }
  
  export interface InventreeParameter {
    template_detail: {
      name: string;
      description?: string;
      units?: string;
      [key: string]: any;
    };
    data: string;
    [key: string]: any;
  }
  
  export interface ProcessedVariant {
    template: InventreeItem;
    variants: InventreeItem[];
    totalStock: number;
    [key: string]: any;
  }
}

declare module 'inventree-card/utils/helpers' {
  export function parseState(state: any): any;
  // Add other helper functions as needed
}

declare module 'inventree-card/core/settings' {
  export const DEFAULT_CONFIG: any;
  // Add other settings as needed
} 