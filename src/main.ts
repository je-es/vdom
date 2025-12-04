// src/main.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    export { createElement, Fragment, h, jsx, jsxs, jsxDEV } from './core/createElement';
    export { html } from './core/html';
    export { render, createDOMElement } from './core/render';
    export { patch } from './core/patch';
    export { updateProps, setProperty, removeProperty } from './core/props';

    export {
        setConfig,
        getConfig,
        VDOMError,
        handleError,
        warn,
        assert,
        createErrorPlaceholder,
        validateVNode,
        withErrorHandling
    } from './utils/errors';

    export {
        isNullOrBoolean,
        isVNode,
        isPrimitive,
        flattenChildren,
        sanitizeHTML,
        camelToKebab,
        shallowEqual,
        generateId,
        isBrowser,
        getChildAt,
        isFunction,
        isEventProp,
        getEventName,
        deepClone
    } from './utils/helpers';

    export type {
        VNode,
        VNodeProps,
        VNodeChild,
        VNodeChildren,
        VNodePrimitive,
        StyleObject,
        EventHandler,
        RefCallback,
        VDOMConfig,
        ParseContext,
        KeyedChildInfo,
        RenderFunction,
        Markers,
        HTMLAttributes,
        BooleanAttributes,
        FormAttributes,
        ARIAAttributes,
        MouseEventHandlers,
        KeyboardEventHandlers,
        FormEventHandlers,
        TouchEventHandlers,
        DragEventHandlers,
        OtherEventHandlers,
        EventHandlers
    } from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝