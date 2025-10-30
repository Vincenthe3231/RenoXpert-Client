"use client"

export function getItem<T>(key: string): T | null {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return null;
        }
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error);
        return null;
    }
}

export function setItem<T>(key: string, value: T) {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item ${key} in localStorage:`, error);
    }
}

export function removeItem(key: string) {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing item ${key} from localStorage:`, error);
    }
}

export function clear() {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}