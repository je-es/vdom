// src/utils/errors.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode, VDOMConfig } from '../types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Global configuration
     */
    let config: VDOMConfig = {
        devMode: process.env.NODE_ENV !== 'production',
        sanitizeHTML: true,
        onError: undefined,
    };

    /**
     * Set global configuration
     */
    export function setConfig(newConfig: Partial<VDOMConfig>): void {
        config = { ...config, ...newConfig };
    }

    /**
     * Get current configuration
     */
    export function getConfig(): VDOMConfig {
        return { ...config };
    }

    /**
     * Custom error class for VDOM errors
     */
    export class VDOMError extends Error {
        constructor(
            message: string,
            public vnode?: VNode,
            public context?: string
        ) {
            super(message);
            this.name = 'VDOMError';
        }
    }

    /**
     * Handle errors with custom error handler if provided
     */
    export function handleError(error: Error, vnode?: VNode, context?: string): void {
        const vdomError = error instanceof VDOMError
            ? error
            : new VDOMError(error.message, vnode, context);

        if (config.onError) {
            try {
                config.onError(vdomError, vnode);
            } catch (handlerError) {
                console.error('Error in custom error handler:', handlerError);
                console.error('Original error:', vdomError);
            }
        } else {
            console.error('VDOM Error:', vdomError.message);
            if (config.devMode && vnode) {
                console.error('VNode:', vnode);
                if (context) console.error('Context:', context);
            }
        }
    }

    /**
     * Warning function (only in dev mode)
     */
    export function warn(message: string, vnode?: VNode): void {
        if (config.devMode) {
            console.warn(`[VDOM Warning]: ${message}`);
            if (vnode) console.warn('VNode:', vnode);
        }
    }

    /**
     * Assert function for development checks
     */
    export function assert(condition: boolean, message: string): void {
        if (config.devMode && !condition) {
            throw new VDOMError(`Assertion failed: ${message}`);
        }
    }

    /**
     * Create error placeholder element
     */
    export function createErrorPlaceholder(error: Error): Text {
        const message = config.devMode
            ? `[Render Error: ${error.message}]`
            : '[Render Error]';
        return document.createTextNode(message);
    }

    /**
     * Validate VNode structure
     */
    export function validateVNode(vnode: unknown): vnode is VNode {
        if (!vnode || typeof vnode !== 'object') {
            return false;
        }

        if (!('type' in vnode && 'props' in vnode && 'children' in vnode)) {
            if (config.devMode) {
                warn('Invalid VNode structure: missing required properties (type, props, children)', vnode as VNode);
            }
            return false;
        }

        if (typeof vnode.type !== 'string') {
            if (config.devMode) {
                warn('Invalid VNode type: must be a string', vnode as VNode);
            }
            return false;
        }

        if (!Array.isArray(vnode.children)) {
            if (config.devMode) {
                warn('Invalid VNode children: must be an array', vnode as VNode);
            }
            return false;
        }

        return true;
    }

    /**
     * Wrap function with error handling
     */
    export function withErrorHandling<TArgs extends unknown[], TReturn>(
        fn: (...args: TArgs) => TReturn,
        context?: string
    ): (...args: TArgs) => TReturn | null {
        return (...args: TArgs): TReturn | null => {
            try {
                return fn(...args);
            } catch (error) {
                handleError(error as Error, undefined, context);
                return null;
            }
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝