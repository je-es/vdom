// src/utils/helpers.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNodeChild, VNodeChildren } from '../types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Check if value should be skipped in rendering
     */
    export function isNullOrBoolean(value: unknown): value is false | null | undefined | true {
        return value === false || value === null || value === undefined || value === true;
    }

    /**
     * Check if value is a VNode
     * FIX: Return false for null instead of null
     */
    export function isVNode(value: unknown): boolean {
        if (!value || typeof value !== 'object') {
            return false;
        }
        return 'type' in value && 'props' in value && 'children' in value;
    }

    /**
     * Check if value is a primitive that can be rendered
     */
    export function isPrimitive(value: unknown): value is string | number {
        return typeof value === 'string' || typeof value === 'number';
    }

    /**
     * Flatten nested children arrays recursively
     */
    export function flattenChildren(children: VNodeChildren[]): VNodeChild[] {
        const flattened: VNodeChild[] = [];

        for (const child of children) {
            if (Array.isArray(child)) {
                flattened.push(...flattenChildren(child));
            } else if (!isNullOrBoolean(child)) {
                flattened.push(child);
            }
        }

        return flattened;
    }

    /**
     * Sanitize HTML to prevent XSS attacks
     */
    export function sanitizeHTML(html: string): string {
        // Remove dangerous patterns
        const dangerous = [
            /<script[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // inline event handlers like onerror=
            /<iframe[\s\S]*?<\/iframe>/gi,
            /<object[\s\S]*?<\/object>/gi,
            /<embed[\s\S]*?>/gi,
        ];

        let sanitized = html;
        for (const pattern of dangerous) {
            sanitized = sanitized.replace(pattern, '');
        }

        return sanitized;
    }

    /**
     * Convert camelCase to kebab-case
     */
    export function camelToKebab(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Check if two values are equal (shallow comparison)
     */
    export function shallowEqual(a: unknown, b: unknown): boolean {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (typeof a !== 'object' || a === null || b === null) return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b as Record<string, unknown>);

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return false;
        }

        return true;
    }

    /**
     * Generate unique ID
     */
    let idCounter = 0;
    export function generateId(prefix = 'vdom'): string {
        return `${prefix}-${++idCounter}-${Date.now()}`;
    }

    /**
     * Check if code is running in browser environment
     */
    export function isBrowser(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    /**
     * Safe way to get element from parent by index
     */
    export function getChildAt(parent: HTMLElement, index: number): Node | undefined {
        return parent.childNodes[index] as Node | undefined;
    }

    /**
     * Check if value is a function
     */
    export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
        return typeof value === 'function';
    }

    /**
     * Check if string is an event handler prop name
     */
    export function isEventProp(propName: string): boolean {
        return propName.startsWith('on') && propName.length > 2;
    }

    /**
     * Get event name from prop name (onclick -> click)
     */
    export function getEventName(propName: string): string {
        return propName.substring(2).toLowerCase();
    }

    /**
     * Deep clone object (simple implementation)
     */
    export function deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(deepClone) as T;

        const cloned: Record<string, unknown> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
            }
        }
        return cloned as T;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝