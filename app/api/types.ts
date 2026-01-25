// Common API types to avoid using 'any'
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type RequestBody = Record<string, JsonValue>;
export type ResponseData<T = JsonValue> = {
    success: boolean;
    data?: T;
    error?: string;
    pagination?: {
        total: number;
        pages: number;
        limit: number;
    };
};
