// src/core/render.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode } from '../types';
    import { isNullOrBoolean, isPrimitive } from '../utils/helpers';
    import { handleError, createErrorPlaceholder, validateVNode } from '../utils/errors';
    import { updateProps } from './props';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Create a real DOM element from a VNode
     *
     * @param vnode - Virtual node to convert
     * @returns HTML element, text node, or document fragment
     */
    export function createDOMElement(vnode: VNode | string | number): HTMLElement | Text | DocumentFragment {
        try {
            // Handle text nodes (primitives)
            if (isPrimitive(vnode)) {
                return document.createTextNode(String(vnode));
            }

            // Validate VNode structure
            if (!validateVNode(vnode)) {
                throw new Error('Invalid VNode structure');
            }

            // Handle fragments
            if (vnode.type === 'fragment') {
                return createFragment(vnode);
            }

            // Handle regular elements
            return createRegularElement(vnode);

        } catch (error) {
            handleError(error as Error, typeof vnode === 'object' ? vnode : undefined, 'createDOMElement');
            return createErrorPlaceholder(error as Error);
        }
    }

    /**
     * Create a document fragment from VNode
     */
    function createFragment(vnode: VNode): DocumentFragment {
        const fragment = document.createDocumentFragment();

        for (const child of vnode.children) {
            if (isNullOrBoolean(child)) continue;

            const childElement = isPrimitive(child)
                ? document.createTextNode(String(child))
                : createDOMElement(child as VNode);

            fragment.appendChild(childElement);
        }

        return fragment;
    }

    /**
     * Create a regular HTML element from VNode
     */
    function createRegularElement(vnode: VNode): HTMLElement {
        // Create element
        const element = document.createElement(vnode.type);

        // Set properties
        updateProps(element, {}, vnode.props);

        // Append children
        for (const child of vnode.children) {
            if (isNullOrBoolean(child)) continue;

            const childElement = isPrimitive(child)
                ? document.createTextNode(String(child))
                : createDOMElement(child as VNode);

            element.appendChild(childElement);
        }

        return element;
    }

    /**
     * Main render function - renders VNode to container
     *
     * @param vnode - Virtual node to render
     * @param container - Container element
     *
     * @example
     * ```ts
     * const app = createElement('div', {}, 'Hello World');
     * render(app, document.getElementById('root')!);
     * ```
     */
    export function render(vnode: VNode, container: HTMLElement): void {
        try {
            // Clear container
            container.innerHTML = '';

            // Create and append element
            const element = createDOMElement(vnode);
            container.appendChild(element);

        } catch (error) {
            handleError(error as Error, vnode, 'render');
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝