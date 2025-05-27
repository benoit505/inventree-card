export declare const CARD_VERSION = "1.0.0";
export declare const CARD_NAME = "inventree-card";
export declare const CARD_TYPE = "inventree-card";
export declare const EDITOR_NAME = "inventree-card-editor";
export declare const DEFAULT_CONFIG: Record<string, any>;
export declare const SCHEMA: ({
    name: string;
    required: boolean;
    selector: {
        entity: {
            domain: string[];
            multiple: boolean;
        };
        select?: undefined;
    };
} | {
    name: string;
    selector: {
        select: {
            options: {
                value: string;
                label: string;
            }[];
            mode: string;
        };
        entity?: undefined;
    };
    required?: undefined;
} | {
    name: string;
    selector: {
        entity: {
            domain: string[];
            multiple: boolean;
        };
        select?: undefined;
    };
    required?: undefined;
})[];
