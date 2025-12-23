/**
 * Primitive types that can be rendered as children
 */
type VNodePrimitive = string | number | boolean | null | undefined;
/**
 * Valid child types for VNode
 */
type VNodeChild = VNode | VNodePrimitive;
/**
 * Array of children (can be nested)
 */
type VNodeChildren = VNodeChild | VNodeChild[];
/**
 * Style object type
 */
type StyleObject = Partial<CSSStyleDeclaration> & Record<string, string | number | undefined>;
/**
 * Event handler type
 */
type EventHandler<T = Event> = (event: T) => void;
/**
 * Ref callback type
 */
type RefCallback<T = HTMLElement> = (element: T | null) => void;
/**
 * Virtual Node structure
 */
interface VNode {
    type: string | 'fragment';
    props: VNodeProps;
    children: VNodeChild[];
}
/**
 * Properties that can be attached to a VNode
 * Extended by HTMLAttributes, BooleanAttributes, etc. in the complete type system
 */
interface VNodeProps {
    [key: string]: unknown;
    children?: VNodeChild[];
    className?: string;
    class?: string;
    style?: string | StyleObject;
    ref?: RefCallback;
    key?: string | number;
    [key: `data-${string}`]: unknown;
}

/**
 * Common HTML attributes
 */
interface HTMLAttributes {
    id?: string;
    title?: string;
    tabIndex?: number;
    role?: string;
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
}
/**
 * Boolean attributes
 */
interface BooleanAttributes {
    checked?: boolean;
    disabled?: boolean;
    selected?: boolean;
    readOnly?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    multiple?: boolean;
    hidden?: boolean;
}
/**
 * Form attributes
 */
interface FormAttributes {
    value?: string | number;
    placeholder?: string;
    name?: string;
    type?: string;
    accept?: string;
    autocomplete?: string;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
    maxLength?: number;
    minLength?: number;
}
/**
 * ARIA attributes
 */
interface ARIAAttributes {
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-hidden'?: boolean;
    'aria-disabled'?: boolean;
    'aria-expanded'?: boolean;
    'aria-selected'?: boolean;
    'aria-checked'?: boolean | 'mixed';
    'aria-pressed'?: boolean | 'mixed';
    'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
    'aria-live'?: 'off' | 'polite' | 'assertive';
    'aria-atomic'?: boolean;
    'aria-busy'?: boolean;
    'aria-controls'?: string;
    'aria-owns'?: string;
}
/**
 * Mouse event handlers
 */
interface MouseEventHandlers {
    onclick?: EventHandler<MouseEvent>;
    ondblclick?: EventHandler<MouseEvent>;
    onmousedown?: EventHandler<MouseEvent>;
    onmouseup?: EventHandler<MouseEvent>;
    onmousemove?: EventHandler<MouseEvent>;
    onmouseover?: EventHandler<MouseEvent>;
    onmouseout?: EventHandler<MouseEvent>;
    onmouseenter?: EventHandler<MouseEvent>;
    onmouseleave?: EventHandler<MouseEvent>;
    oncontextmenu?: EventHandler<MouseEvent>;
}
/**
 * Keyboard event handlers
 */
interface KeyboardEventHandlers {
    onkeydown?: EventHandler<KeyboardEvent>;
    onkeyup?: EventHandler<KeyboardEvent>;
    onkeypress?: EventHandler<KeyboardEvent>;
}
/**
 * Form event handlers
 */
interface FormEventHandlers {
    onchange?: EventHandler<Event>;
    oninput?: EventHandler<InputEvent>;
    onfocus?: EventHandler<FocusEvent>;
    onblur?: EventHandler<FocusEvent>;
    onsubmit?: EventHandler<SubmitEvent>;
    onreset?: EventHandler<Event>;
    oninvalid?: EventHandler<Event>;
}
/**
 * Touch event handlers
 */
interface TouchEventHandlers {
    ontouchstart?: EventHandler<TouchEvent>;
    ontouchmove?: EventHandler<TouchEvent>;
    ontouchend?: EventHandler<TouchEvent>;
    ontouchcancel?: EventHandler<TouchEvent>;
}
/**
 * Drag event handlers
 */
interface DragEventHandlers {
    ondragstart?: EventHandler<DragEvent>;
    ondrag?: EventHandler<DragEvent>;
    ondragend?: EventHandler<DragEvent>;
    ondragenter?: EventHandler<DragEvent>;
    ondragleave?: EventHandler<DragEvent>;
    ondragover?: EventHandler<DragEvent>;
    ondrop?: EventHandler<DragEvent>;
}
/**
 * Other event handlers
 */
interface OtherEventHandlers {
    onscroll?: EventHandler<Event>;
    onwheel?: EventHandler<WheelEvent>;
    oncopy?: EventHandler<ClipboardEvent>;
    oncut?: EventHandler<ClipboardEvent>;
    onpaste?: EventHandler<ClipboardEvent>;
    onload?: EventHandler<Event>;
    onerror?: EventHandler<Event>;
}
/**
 * All event handlers combined
 */
interface EventHandlers extends MouseEventHandlers, KeyboardEventHandlers, FormEventHandlers, TouchEventHandlers, DragEventHandlers, OtherEventHandlers {
}

/**
 * Parse context for html template literals
 */
interface ParseContext {
    eventHandlers: Map<string, EventHandler>;
    vnodes: Map<string, VNode>;
    arrays: Map<string, VNodeChildren[]>;
    plainValues: Map<string, unknown>;
}
/**
 * Keyed child info for efficient patching
 */
interface KeyedChildInfo {
    vnode: VNode;
    index: number;
    element: Node;
}
/**
 * Configuration options for the vdom library
 */
interface VDOMConfig {
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
type RenderFunction = (vnode: VNode, container: HTMLElement) => void;
/**
 * Markers for template literal parsing
 */
interface Markers {
    EVENT: string;
    VNODE: string;
    ARRAY: string;
    VALUE: string;
}

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
declare function createElement(type: string | 'fragment', props?: VNodeProps | string | null, ...children: VNodeChildren[]): VNode;
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
declare function Fragment(...children: VNodeChild[]): VNode;
/**
 * Create a text node
 *
 * @param text - Text content
 * @returns String that will be rendered as text
 */
declare function createTextNode(text: string | number): string;
/**
 * JSX Factory function (for JSX pragma)
 * Alias for createElement to be used with JSX
 */
declare const h: typeof createElement;
declare const div: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const span: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const label: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const input: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const textarea: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const select: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const option: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const button: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const form: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const p: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h1: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h2: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h3: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h4: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h5: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const h6: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const a: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const img: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
declare const i: (props?: VNodeProps | string | null | undefined, ...children: VNodeChildren[]) => VNode;
/**
 * JSX Fragment factory
 */
declare const jsx: typeof createElement;
declare const jsxs: typeof createElement;
declare const jsxDEV: typeof createElement;

/**
 * HTML tagged template literal
 * Creates VNodes from HTML template strings with interpolated values
 *
 * FIX: Store event handlers separately and apply after parsing to avoid HTML parser issues
 */
declare function html(strings: TemplateStringsArray, ...values: unknown[]): VNode;

/**
 * Create a real DOM element from a VNode
 *
 * @param vnode - Virtual node to convert
 * @returns HTML element, text node, or document fragment
 */
declare function createDOMElement(vnode: VNode | string | number): HTMLElement | Text | DocumentFragment;
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
declare function render(vnode: VNode, container: HTMLElement): void;

/**
 * Patch children by index (simple diffing without keys)
 */
declare function patchChildrenByIndex(parent: HTMLElement, oldChildren: VNodeChild[], newChildren: VNodeChild[]): void;
/**
 * Patch children with keys (optimized diffing)
 * Properly map VNode children to DOM elements
 */
declare function patchChildrenWithKeys(parent: HTMLElement, oldChildren: VNodeChild[], newChildren: VNodeChild[]): void;
/**
 * Patch children - decides between keyed and simple patching
 */
declare function patchChildren(parent: HTMLElement, oldChildren: VNodeChild[], newChildren: VNodeChild[]): void;
/**
 * Patch/diff algorithm - updates DOM based on VNode changes
 *
 * @param parent - Parent HTML element
 * @param oldVNode - Old virtual node
 * @param newVNode - New virtual node
 * @param index - Child index in parent
 */
declare function patch(parent: HTMLElement, oldVNode: VNode | string | number | null, newVNode: VNode | string | number | null, index?: number): void;

/**
 * Update element properties
 */
declare function updateProps(element: HTMLElement, oldProps: VNodeProps, newProps: VNodeProps): void;
/**
 * Set a single property on element
 */
declare function setProperty(element: HTMLElement, key: string, value: unknown, oldValue?: unknown): void;
/**
 * Remove a property from element
 */
declare function removeProperty(element: HTMLElement, key: string, oldValue: unknown): void;

/**
 * Set global configuration
 */
declare function setConfig(newConfig: Partial<VDOMConfig>): void;
/**
 * Get current configuration
 */
declare function getConfig(): VDOMConfig;
/**
 * Custom error class for VDOM errors
 */
declare class VDOMError extends Error {
    vnode?: VNode | undefined;
    context?: string | undefined;
    constructor(message: string, vnode?: VNode | undefined, context?: string | undefined);
}
/**
 * Handle errors with custom error handler if provided
 */
declare function handleError(error: Error, vnode?: VNode, context?: string): void;
/**
 * Warning function (only in dev mode)
 */
declare function warn(message: string, vnode?: VNode): void;
/**
 * Assert function for development checks
 */
declare function assert(condition: boolean, message: string): void;
/**
 * Create error placeholder element
 */
declare function createErrorPlaceholder(error: Error): Text;
/**
 * Validate VNode structure
 */
declare function validateVNode(vnode: unknown): vnode is VNode;
/**
 * Wrap function with error handling
 */
declare function withErrorHandling<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn, context?: string): (...args: TArgs) => TReturn | null;

/**
 * Check if value should be skipped in rendering
 */
declare function isNullOrBoolean(value: unknown): value is false | null | undefined | true;
/**
 * Check if value is a VNode
 * FIX: Return false for null instead of null
 */
declare function isVNode(value: unknown): boolean;
/**
 * Check if value is a primitive that can be rendered
 */
declare function isPrimitive(value: unknown): value is string | number;
/**
 * Flatten nested children arrays recursively
 */
declare function flattenChildren(children: VNodeChildren[]): VNodeChild[];
/**
 * Sanitize HTML to prevent XSS attacks
 */
declare function sanitizeHTML(html: string): string;
/**
 * Convert camelCase to kebab-case
 */
declare function camelToKebab(str: string): string;
/**
 * Check if two values are equal (shallow comparison)
 */
declare function shallowEqual(a: unknown, b: unknown): boolean;
declare function generateId(prefix?: string): string;
/**
 * Check if code is running in browser environment
 */
declare function isBrowser(): boolean;
/**
 * Safe way to get element from parent by index
 */
declare function getChildAt(parent: HTMLElement, index: number): Node | undefined;
/**
 * Check if value is a function
 */
declare function isFunction(value: unknown): value is (...args: unknown[]) => unknown;
/**
 * Check if string is an event handler prop name
 */
declare function isEventProp(propName: string): boolean;
/**
 * Get event name from prop name (onclick -> click)
 */
declare function getEventName(propName: string): string;
/**
 * Deep clone object (simple implementation)
 */
declare function deepClone<T>(obj: T): T;

export { type ARIAAttributes, type BooleanAttributes, type DragEventHandlers, type EventHandler, type EventHandlers, type FormAttributes, type FormEventHandlers, Fragment, type HTMLAttributes, type KeyboardEventHandlers, type KeyedChildInfo, type Markers, type MouseEventHandlers, type OtherEventHandlers, type ParseContext, type RefCallback, type RenderFunction, type StyleObject, type TouchEventHandlers, type VDOMConfig, VDOMError, type VNode, type VNodeChild, type VNodeChildren, type VNodePrimitive, type VNodeProps, a, assert, button, camelToKebab, createDOMElement, createElement, createErrorPlaceholder, createTextNode, deepClone, div, flattenChildren, form, generateId, getChildAt, getConfig, getEventName, h, h1, h2, h3, h4, h5, h6, handleError, html, i, img, input, isBrowser, isEventProp, isFunction, isNullOrBoolean, isPrimitive, isVNode, jsx, jsxDEV, jsxs, label, option, p, patch, patchChildren, patchChildrenByIndex, patchChildrenWithKeys, removeProperty, render, sanitizeHTML, select, setConfig, setProperty, shallowEqual, span, textarea, updateProps, validateVNode, warn, withErrorHandling };
