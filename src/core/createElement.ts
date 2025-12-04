// src/core/createElement.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode, VNodeProps, VNodeChild, VNodeChildren } from '../types';
    import { flattenChildren } from '../utils/helpers';
    import { warn } from '../utils/errors';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Create a Virtual Node
     *
     * @param type - Element type or 'fragment'
     * @param props - Element properties
     * @param children - Child elements
     * @returns VNode
     *
     * @example
     * ```ts
     * const vnode = createElement('div', { className: 'box' }, 'Hello World');
     * ```
     */
    export function createElement(
        type: string | 'fragment',
        props: VNodeProps | null,
        ...children: VNodeChildren[]
    ): VNode {
        // Validate type in development
        if (process.env.NODE_ENV !== 'production') {
            if (!type || typeof type !== 'string') {
                warn(`Invalid element type: ${type}`);
            }
        }

        const flatChildren = flattenChildren(children);

        // Handle fragments
        if (type === 'fragment') {
            return {
                type: 'fragment',
                props: {},
                children: flatChildren,
            };
        }

        // Handle class vs className
        const normalizedProps = props ? { ...props } : {};
        if (normalizedProps.class && !normalizedProps.className) {
            normalizedProps.className = normalizedProps.class;
            delete normalizedProps.class;
        }

        return {
            type,
            props: normalizedProps,
            children: flatChildren,
        };
    }

    /**
     * Create a fragment (wrapper for multiple children without parent element)
     *
     * @param children - Child elements
     * @returns VNode with type 'fragment'
     *
     * @example
     * ```ts
     * const frag = Fragment(
     *   createElement('div', {}, 'First'),
     *   createElement('div', {}, 'Second')
     * );
     * ```
     */
    export function Fragment(...children: VNodeChild[]): VNode {
        return createElement('fragment', null, ...children);
    }

    /**
     * Create a text node
     *
     * @param text - Text content
     * @returns String that will be rendered as text
     */
    export function createTextNode(text: string | number): string {
        return String(text);
    }

    /**
     * JSX Factory function (for JSX pragma)
     * Alias for createElement to be used with JSX
     */
    export const h = createElement;

    /**
     * JSX Fragment factory
     */
    export const jsx = createElement;
    export const jsxs = createElement;
    export const jsxDEV = createElement;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝