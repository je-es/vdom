// src/types/internal.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    import type { VNode, EventHandler, VNodeChildren } from './core';

    /**
     * Parse context for html template literals
     */
    export interface ParseContext {
        eventHandlers: Map<string, EventHandler>;
        vnodes: Map<string, VNode>;
        arrays: Map<string, VNodeChildren[]>;
        plainValues: Map<string, unknown>;
    }

    /**
     * Keyed child info for efficient patching
     */
    export interface KeyedChildInfo {
        vnode: VNode;
        index: number;
        element: Node;
    }

    /**
     * Configuration options for the vdom library
     */
    export interface VDOMConfig {
        /**
         * Enable development mode with warnings
         */
        devMode?: boolean;

        /**
         * Enable HTML sanitization (recommended for user-generated content)
         */
        sanitizeHTML?: boolean;

        /**
         * Custom error handler
         */
        onError?: (error: Error, vnode?: VNode) => void;
    }

    /**
     * Render function type
     */
    export type RenderFunction = (vnode: VNode, container: HTMLElement) => void;

    /**
     * Markers for template literal parsing
     */
    export interface Markers {
        EVENT: string;
        VNODE: string;
        ARRAY: string;
        VALUE: string;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝