// src/core/html.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNode, ParseContext, EventHandler, VNodeChild } from '../types';
    import { isNullOrBoolean } from '../utils/helpers';
    import { sanitizeHTML } from '../utils/helpers';
    import { getConfig } from '../utils/errors';
    import { createElement } from './createElement';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Markers for identifying interpolated values
     */
    const MARKERS = {
        EVENT: '__EVENT_',
        VNODE: '__VNODE_',
        ARRAY: '__ARRAY_',
        VALUE: '__VALUE_'
    } as const;

    /**
     * HTML tagged template literal
     * Creates VNodes from HTML template strings with interpolated values
     *
     * FIX: Store event handlers separately and apply after parsing to avoid HTML parser issues
     */
    export function html(
        strings: TemplateStringsArray,
        ...values: unknown[]
    ): VNode {
        const context: ParseContext = {
            eventHandlers: new Map(),
            vnodes: new Map(),
            arrays: new Map(),
            plainValues: new Map(),
        };

        let htmlString = '';

        // Build HTML string and store values
        for (let i = 0; i < strings.length; i++) {
            const str = strings[i];
            htmlString += str;

            if (i < values.length) {
                const value = values[i];

                if (isNullOrBoolean(value)) {
                    if (value === false && isInAttribute(str)) {
                        htmlString += 'false';
                    }
                    continue;
                }

                const marker = createMarker(value, i, context);
                htmlString += marker;
            }
        }

        const vnode = parseHTML(htmlString, context);

        // Apply event handlers from context to the VNode
        applyEventHandlers(vnode, context);

        return vnode;
    }

    /**
     * Apply stored event handlers to VNode props
     * Recursively searches for event handler markers and replaces them with actual functions
     */
    function applyEventHandlers(vnode: VNode, context: ParseContext): void {
        // Check props for event handler markers and replace them
        for (const [key, value] of Object.entries(vnode.props)) {
            if (key.startsWith('on') && typeof value === 'string') {
                // The value should be the event marker like "__EVENT_0__"
                // Try exact match first
                if (context.eventHandlers.has(value)) {
                    vnode.props[key] = context.eventHandlers.get(value);
                    continue;
                }

                // If not exact match, try finding any marker that's contained in the value
                for (const [marker, handler] of context.eventHandlers) {
                    if (value.includes(marker)) {
                        vnode.props[key] = handler;
                        break;
                    }
                }
            }
        }

        // Recursively apply to children
        for (const child of vnode.children) {
            if (child && typeof child === 'object' && 'type' in child) {
                applyEventHandlers(child as VNode, context);
            }
        }
    }

    /**
     * Check if we're currently inside an attribute VALUE (not name)
     */
    function isInAttribute(str: string): boolean {
        const lastEqualIndex = str.lastIndexOf('=');
        const lastGtIndex = str.lastIndexOf('>');
        return lastEqualIndex > lastGtIndex;
    }

    /**
     * Create appropriate marker for value type
     */
    function createMarker(value: unknown, index: number, context: ParseContext): string {
        // Arrays
        if (Array.isArray(value)) {
            const marker = `${MARKERS.ARRAY}${index}__`;
            context.arrays.set(marker, value);
            return marker;
        }

        // Functions (event handlers)
        if (typeof value === 'function') {
            const marker = `${MARKERS.EVENT}${index}__`;
            context.eventHandlers.set(marker, value as EventHandler);
            return marker;
        }

        // VNodes
        if (value && typeof value === 'object' && 'type' in value) {
            const marker = `${MARKERS.VNODE}${index}__`;
            context.vnodes.set(marker, value as VNode);
            return marker;
        }

        // Plain values
        const marker = `${MARKERS.VALUE}${index}__`;
        context.plainValues.set(marker, value);
        return marker;
    }

    /**
     * Parse HTML string to VNode
     */
    function parseHTML(html: string, context: ParseContext): VNode {
        const config = getConfig();

        let processedHTML = html.trim();

        if (config.sanitizeHTML) {
            // CRITICAL FIX: Protect event markers BEFORE sanitization
            // The sanitizer removes onclick="..." attributes, so we need to protect our markers
            const eventMarkerProtection: { placeholder: string; original: string }[] = [];
            let protectionIndex = 0;

            // Replace onclick="__EVENT_N__" with a safe placeholder
            processedHTML = processedHTML.replace(/\s+(on\w+)="(__EVENT_\d+__)"/g, (match, eventName, marker) => {
                const placeholder = `data-vdom-event-${protectionIndex}="${marker}"`;
                eventMarkerProtection.push({ placeholder, original: match });
                protectionIndex++;
                return ` ${placeholder}`;
            });

            // Also handle onclick=__EVENT_N__ (without quotes)
            processedHTML = processedHTML.replace(/\s+(on\w+)=(__EVENT_\d+__)/g, (match, eventName, marker) => {
                const placeholder = `data-vdom-event-${protectionIndex}="${marker}"`;
                eventMarkerProtection.push({ placeholder, original: match });
                protectionIndex++;
                return ` ${placeholder}`;
            });

            // Now sanitize
            processedHTML = sanitizeHTML(processedHTML);

            // Restore event markers
            for (const { placeholder, original } of eventMarkerProtection) {
                processedHTML = processedHTML.replace(placeholder, original);
            }
        }

        const template = document.createElement('template');
        template.innerHTML = processedHTML;

        const element = template.content.firstChild as HTMLElement;

        if (!element) {
            return createElement('div', {}, '');
        }

        const result = convertDOMToVNode(element, context);

        // If result is a string (text node), wrap it in a span
        if (typeof result === 'string') {
            return createElement('span', {}, result);
        }

        return result;
    }

    /**
     * Convert DOM node to VNode
     */
    function convertDOMToVNode(element: Node, context: ParseContext): VNode | string {
        // Text nodes
        if (element.nodeType === Node.TEXT_NODE) {
            return handleTextNode(element.textContent || '', context);
        }

        // Skip non-element nodes
        if (element.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const el = element as HTMLElement;
        const props = parseAttributes(el.attributes, context);
        const children = parseChildren(el.childNodes, context) as VNodeChild[];

        return {
            type: el.tagName.toLowerCase(),
            props,
            children,
        };
    }

    /**
     * Handle text node with markers
     */
    function handleTextNode(text: string, context: ParseContext): VNode | string {
        // Check for array markers
        for (const [marker, array] of context.arrays) {
            if (text.includes(marker)) {
                return {
                    type: 'fragment',
                    props: {},
                    children: array.filter(item => !isNullOrBoolean(item)) as VNodeChild[],
                };
            }
        }

        // Check for VNode markers
        for (const [marker, vnode] of context.vnodes) {
            if (text.includes(marker)) {
                return vnode;
            }
        }

        // Replace value markers
        let processedText = text;
        for (const [marker, value] of context.plainValues) {
            processedText = processedText.replace(marker, String(value));
        }

        return processedText;
    }

    /**
     * Parse element attributes
     * IMPORTANT: Just store the raw marker values for event handlers
     * We'll replace them with actual functions in applyEventHandlers
     */
    function parseAttributes(
        attributes: NamedNodeMap,
        context: ParseContext
    ): Record<string, unknown> {
        const props: Record<string, unknown> = {};

        for (const attr of Array.from(attributes)) {
            const { name, value } = attr;

            // Event handlers - keep the marker string as-is
            // It will be replaced by applyEventHandlers later
            if (name.startsWith('on')) {
                props[name] = value;
                continue;
            }

            // Class names
            if (name === 'class') {
                props.className = replaceMarkers(value, context.plainValues).trim();
                continue;
            }

            // Boolean attributes
            if (name === 'checked' || name === 'disabled' || name === 'selected' || name === 'required') {
                const replaced = replaceMarkers(value, context.plainValues);

                if (replaced === 'false') {
                    continue;
                } else if (replaced === 'true' || replaced === '') {
                    props[name] = true;
                } else {
                    props[name] = replaced;
                }
                continue;
            }

            // Regular attributes
            props[name] = replaceMarkers(value, context.plainValues);
        }

        return props;
    }

    /**
     * Parse child nodes
     */
    function parseChildren(childNodes: NodeListOf<ChildNode>, context: ParseContext): unknown[] {
        const children: unknown[] = [];

        for (const child of Array.from(childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent || '';

                // Check for array markers
                let foundArray = false;
                for (const [marker, array] of context.arrays) {
                    if (text.includes(marker)) {
                        children.push(...array.filter(item => !isNullOrBoolean(item)));
                        foundArray = true;
                        break;
                    }
                }
                if (foundArray) continue;

                // Check for VNode markers
                const foundVNodes: unknown[] = [];
                for (const [marker, vnode] of context.vnodes) {
                    if (text.includes(marker)) {
                        if (vnode && typeof vnode === 'object' && 'type' in vnode) {
                            foundVNodes.push(vnode);
                        }
                    }
                }
                if (foundVNodes.length > 0) {
                    children.push(...foundVNodes);
                    continue;
                }

                // Add processed text
                if (text.trim()) {
                    const processedText = replaceMarkers(text, context.plainValues);
                    if (processedText.trim()) {
                        children.push(processedText);
                    }
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const converted = convertDOMToVNode(child, context);
                if (converted) children.push(converted);
            }
        }

        return children;
    }

    /**
     * Replace markers in string with actual values
     */
    function replaceMarkers(str: string, valueMap: Map<string, unknown>): string {
        let result = str;
        for (const [marker, value] of valueMap) {
            result = result.replace(marker, String(value));
        }
        return result;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝