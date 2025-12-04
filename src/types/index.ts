// src/types/index.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    // Core types
    export type {
        VNodePrimitive,
        VNodeChild,
        VNodeChildren,
        StyleObject,
        EventHandler,
        RefCallback,
        VNode,
        VNodeProps,
    } from './core';

    // Props and attributes
    export type {
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
        EventHandlers,
    } from './props';

    // Internal types
    export type {
        ParseContext,
        KeyedChildInfo,
        VDOMConfig,
        RenderFunction,
        Markers,
    } from './internal';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝