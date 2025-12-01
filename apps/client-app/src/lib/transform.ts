type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export function toCamelCase(str: string): string {
    return str.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

export function toSnakeCase(str: string): string {
    // First, handle uppercase letters
    let result = str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    // Then, handle digits that follow a letter or another digit
    result = result.replace(/([a-z])([0-9])/g, '$1_$2');
    return result;
}

export function keysToCamel<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => keysToCamel(item)) as T;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);
            acc[camelKey] = keysToCamel(obj[key]);
            return acc;
        }, {} as any) as T;
    }

    return obj;
}

export function keysToSnake<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => keysToSnake(item)) as T;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);
            acc[snakeKey] = keysToSnake(obj[key]);
            return acc;
        }, {} as any) as T;
    }

    return obj;
}
