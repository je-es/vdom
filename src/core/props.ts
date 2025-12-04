// src/core/props.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { VNodeProps, StyleObject } from '../types';
    import { isEventProp, getEventName, isFunction } from '../utils/helpers';
    import { warn } from '../utils/errors';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Boolean attributes that work differently
     */
    const BOOLEAN_ATTRS = new Set([
        'checked',
        'selected',
        'disabled',
        'readOnly',
        'required',
        'autoFocus',
        'multiple',
        'hidden',
        'autoplay',
        'controls',
        'loop',
        'muted',
        'open',
        'reversed'
    ]);

    /**
     * Update element properties
     */
    export function updateProps(
        element: HTMLElement,
        oldProps: VNodeProps,
        newProps: VNodeProps
    ): void {
        // Remove old props
        for (const key in oldProps) {
            if (!(key in newProps)) {
                removeProperty(element, key, oldProps[key]);
            }
        }

        // Set new props
        for (const [key, value] of Object.entries(newProps)) {
            if (oldProps[key] !== value) {
                setProperty(element, key, value, oldProps[key]);
            }
        }
    }

    /**
     * Set a single property on element
     */
    export function setProperty(
        element: HTMLElement,
        key: string,
        value: unknown,
        oldValue?: unknown
    ): void {
        // Skip special keys
        if (key === 'children' || key === 'key') return;

        // Event handlers
        if (isEventProp(key)) {
            setEventListener(element, key, value, oldValue);
            return;
        }

        // Ref callback
        if (key === 'ref' && isFunction(value)) {
            value(element);
            return;
        }

        // Class name
        if (key === 'className' || key === 'class') {
            setClassName(element, value);
            return;
        }

        // Style
        if (key === 'style') {
            setStyle(element, value as StyleObject | null | undefined);
            return;
        }

        // Dangerous HTML
        const __value = value as { __html: string } | undefined;
        if (key === 'dangerouslySetInnerHTML' && __value?.__html) {
            element.innerHTML = __value?.__html;
            return;
        }

        // Boolean attributes
        if (BOOLEAN_ATTRS.has(key)) {
            setBooleanAttribute(element, key, value);
            return;
        }

        // Regular attributes
        setAttribute(element, key, value);
    }

    /**
     * Remove a property from element
     */
    export function removeProperty(element: HTMLElement, key: string, oldValue: unknown): void {
        // Event handlers
        if (isEventProp(key) && isFunction(oldValue)) {
            const eventName = getEventName(key);
            element.removeEventListener(eventName, oldValue as EventListenerOrEventListenerObject);
            return;
        }

        // Ref
        if (key === 'ref' && isFunction(oldValue)) {
            oldValue(null);
            return;
        }

        // Class name
        if (key === 'className' || key === 'class') {
            element.className = '';
            element.removeAttribute('class');
            return;
        }

        // Style
        if (key === 'style') {
            element.removeAttribute('style');
            return;
        }

        // Boolean attributes
        if (BOOLEAN_ATTRS.has(key)) {
            element.removeAttribute(key.toLowerCase());
            return;
        }

        // Regular attributes
        element.removeAttribute(key);
    }

    /**
     * Set event listener
     */
    function setEventListener(
        element: HTMLElement,
        propName: string,
        handler: unknown,
        oldHandler?: unknown
    ): void {
        if (!isFunction(handler)) {
            if (process.env.NODE_ENV !== 'production') {
                warn(`Event handler ${propName} is not a function`);
            }
            return;
        }

        const eventName = getEventName(propName);

        // Remove old handler
        if (oldHandler && isFunction(oldHandler)) {
            element.removeEventListener(eventName, oldHandler as EventListenerOrEventListenerObject);
        }

        // Add new handler
        element.addEventListener(eventName, handler as EventListenerOrEventListenerObject);
    }

    /**
     * Set class name
     */
    function setClassName(element: HTMLElement, value: unknown): void {
        if (value == null || value === false) {
            element.className = '';
            element.removeAttribute('class');
            return;
        }

        const className = String(value).trim();
        if (className) {
            element.className = className;
        } else {
            element.className = '';
            element.removeAttribute('class');
        }
    }

    type SetStyleValueType = string | StyleObject | null | undefined;
    /**
     * Set style attribute
     */
    function setStyle(element: HTMLElement, value: SetStyleValueType): void {
        if (value == null) {
            element.removeAttribute('style');
            return;
        }

        // String style
        if (typeof value === 'string') {
            element.setAttribute('style', value);
            return;
        }

        // Object style
        if (typeof value === 'object') {
            for (const [prop, val] of Object.entries(value)) {
                if (val == null) {
                    (element.style as StyleObject)[prop] = '';
                } else {
                    (element.style as StyleObject)[prop] = val as string;
                }
            }
        }
    }

    /**
     * Set boolean attribute
     *
     * FIXED: Treat any value except false, null, undefined as true
     * This matches HTML spec and common framework behavior
     * Special case: empty string '' is valid and sets the attribute
     */
    function setBooleanAttribute(element: HTMLElement, key: string, value: unknown): void {
        const attrName = key.toLowerCase();

        // Explicitly false, null, or undefined removes the attribute
        if (value === false || value === null || value === undefined) {
            element.removeAttribute(attrName);
            return;
        }

        // Any other value (including empty string '') sets the attribute
        // This includes: true, 'true', '', 'yes', 'disabled', numbers, etc.
        element.setAttribute(attrName, '');
    }

    /**
     * Set regular attribute
     */
    function setAttribute(element: HTMLElement, key: string, value: unknown): void {
        if (value == null || value === false) {
            element.removeAttribute(key);
            return;
        }

        // Convert to string and set
        element.setAttribute(key, String(value));
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝