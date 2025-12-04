// src/types/core.d.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    /**
     * Primitive types that can be rendered as children
     */
    export type VNodePrimitive = string | number | boolean | null | undefined;

    /**
     * Valid child types for VNode
     */
    export type VNodeChild = VNode | VNodePrimitive;

    /**
     * Array of children (can be nested)
     */
    export type VNodeChildren = VNodeChild | VNodeChild[];

    /**
     * Style object type
     */
    export type StyleObject = Partial<CSSStyleDeclaration> & Record<string, string | number | undefined>;

    /**
     * Event handler type
     */
    export type EventHandler<T = Event> = (event: T) => void;

    /**
     * Ref callback type
     */
    export type RefCallback<T = HTMLElement> = (element: T | null) => void;

    /**
     * Virtual Node structure
     */
    export interface VNode {
        type: string | 'fragment';
        props: VNodeProps;
        children: VNodeChild[];
    }

    /**
     * Properties that can be attached to a VNode
     * Extended by HTMLAttributes, BooleanAttributes, etc. in the complete type system
     */
    export interface VNodeProps {
        [key: string]: unknown;
        children?: VNodeChild[];
        className?: string;
        class?: string;
        style?: string | StyleObject;
        ref?: RefCallback;
        key?: string | number;

        // Data attributes pattern
        [key: `data-${string}`]: unknown;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝